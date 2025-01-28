import asyncio
import os
from datetime import datetime

from celery import Celery
from celery.schedules import crontab

import email_service
from database import SessionLocal
from model.budgets.budget import Budget
from model.enable_banking.account import Account
from model.enable_banking.transaction import Transaction
from model.users.user import User
from tasks.synchronize_transactions import synchronize_transactions

BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/0')

app = Celery(
    'tasks',
    broker=BROKER_URL,
    backend=BROKER_URL,
)

app.conf.beat_schedule = {
    'synchronize_transactions': {
        'task': 'synchronize_transactions',
        'schedule': crontab(minute="0", hour="0"),
    },
    'check-budgets': {
        'task': 'check_budgets',
        'schedule': 20,
    }
}

@app.task(name="synchronize_transactions")
def synchronize_transactions_task():
    asyncio.run(synchronize_transactions())
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