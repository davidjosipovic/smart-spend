import asyncio
import os
from datetime import datetime
from typing import List

from tasks.ml_tasks import classify_transactions
from celery import Celery
from celery.schedules import crontab

import email_service
from database import SessionLocal
from model.budgets.budget import Budget
from model.enable_banking.account import Account
from model.enable_banking.transaction import Transaction
from model.users.user import User
from tasks.synchronize_transactions import synchronize_transactions

# Create Celery app
app = Celery('tasks')

# Configure Celery
app.conf.update(
    broker_url=os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/0'),
    result_backend=os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/0'),
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,  # Enable task tracking
    task_publish_retry=True,  # Enable retry on publish
    task_publish_retry_policy={
        'max_retries': 3,
        'interval_start': 0,
        'interval_step': 0.2,
        'interval_max': 0.2,
    },
    worker_prefetch_multiplier=1,  # Process one task at a time
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks
    worker_max_memory_per_child=200000,  # Restart worker if memory exceeds 200MB
)

# Import tasks
app.autodiscover_tasks([
    'tasks.ml_tasks',
    'tasks.budget_tasks',
    'tasks.transaction_tasks'
])

# Configure periodic tasks
app.conf.beat_schedule = {
    'check-budgets': {
        'task': 'check_budgets',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
    'synchronize-transactions': {
        'task': 'synchronize_transactions',
        'schedule': crontab(minute="0", hour="0"),  # Every midnight
    },
}

@app.task(name="synchronize_transactions")
def synchronize_transactions_task():
    asyncio.run(synchronize_transactions(None))
    return "Started transactions synchronization."


@app.task(name="check_budgets")
def check_budgets_task():
    db = SessionLocal()
    total_emails_sent = 0
    try:
        budgets = db.query(Budget).all()
        filtered_budgets = [
            budget for budget in budgets
            if is_datetime_in_range(budget.valid_from, budget.valid_until)
        ]

        for budget in filtered_budgets:
            transactions = db.query(Transaction).filter(Transaction.account_id == budget.account_id).all()
            filtered_transactions = [
                transaction for transaction in transactions
                if is_date_in_range(budget.valid_from, budget.valid_until, transaction.booking_date)
            ]
            total = sum([float(transaction.transaction_amount) for transaction in filtered_transactions])

            if total > budget.spending_limit:
                account = db.query(Account).filter(Account.id == budget.account_id).first()
                user = db.query(User).filter(User.id == account.user_id).first()
                email_service.send_email("Budget exceeded!", f"Budget of {budget.spending_limit} has been exceeded by {total - budget.spending_limit}.", user.email)
                total_emails_sent += 1

    finally:
        db.close()
        return f"Total {total_emails_sent} emails sent."

@app.task(name="classify_transactions")
def classify_transactions_task(transaction_ids: List[str]):
    classify_transactions(transaction_ids)
    return "Started transaction classification."

def is_datetime_in_range(valid_from: str, valid_until: str) -> bool:
    valid_from_dt = datetime.fromisoformat(valid_from)
    valid_until_dt = datetime.fromisoformat(valid_until)

    current_dt = datetime.now(valid_from_dt.tzinfo)

    return valid_from_dt <= current_dt <= valid_until_dt

def is_date_in_range(valid_from: str, valid_until: str, check_date: str) -> bool:
    valid_from_dt = datetime.fromisoformat(valid_from)
    valid_until_dt = datetime.fromisoformat(valid_until)

    check_date_dt = datetime.strptime(check_date, "%Y-%m-%d").date()

    valid_from_date = valid_from_dt.date()
    valid_until_date = valid_until_dt.date()

    return valid_from_date <= check_date_dt <= valid_until_date