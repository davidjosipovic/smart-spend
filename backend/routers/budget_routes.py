import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette import status

from contracts.budgets.create_budget import CreateBudgetRequest
from contracts.budgets.update_budget import UpdateBudgetRequest
from database import get_db
from email_service import send_email
from model.budgets.budget import Budget
from model.common.response import Response
from model.enable_banking.account import Account

router = APIRouter(
    tags=["Budget"],
    prefix="/api/budgets"
)

@router.post("/notify-budget-exceeded")
async def notify_budget_exceeded(budget: float, actual_spent: float):
    if actual_spent > budget:
        subject = "Budget Exceeded!"
        content = f"You have exceeded your budget. Your set budget was ${budget} and you've spent ${actual_spent}."
        status_code = send_email(subject, content, "leo@gmail.com")
        
        if status_code == 202:
            return {"message": "Email sent successfully!"}
        elif status_code == 500:
            return {"message": "Failed to send email. Please check the server logs for details."}
        else:
            return {"message": f"Email sending failed with status code {status_code}."}
    else:
        return {"message": "No action needed. Budget is within limits."}

@router.post("/")
async def create_budget(request: CreateBudgetRequest, db: Session = Depends(get_db)):
    response = Response()

    try:
        uuid.UUID(request.account_id)
    except ValueError:
        return response.with_error(f"Invalid UUID: {request.account_id}")

    account = db.query(Account).filter(Account.account_id == request.account_id).first()
    if account is None:
        return response.with_error(f"Account {request.account_id} not found", status.HTTP_404_NOT_FOUND)

    try:
        datetime.strptime(request.valid_from, "%Y-%m-%d %H:%M:%S%z")
    except ValueError:
        return response.with_error(f"Invalid valid_from: {request.valid_from}")

    try:
        datetime.strptime(request.valid_until, "%Y-%m-%d %H:%M:%S%z")
    except ValueError:
        return response.with_error(f"Invalid valid_until: {request.valid_until}")

    if request.spending_limit <= 0:
        return response.with_error(f"Budget must be greater than zero: {request.spending_limit}")

    budget = Budget()
    budget.valid_from = request.valid_from
    budget.valid_until = request.valid_until
    budget.spending_limit = request.spending_limit
    budget.active = True
    budget.account_id = account.id

    if request.name is None:
        budget.name = f"Budget {budget.id}"
    else:
        budget.name = request.name

    db.add(budget)
    db.commit()
    db.refresh(budget)

    return response.success(budget.to_dict(), status.HTTP_201_CREATED)

@router.put("/")
async def update_budget(request: UpdateBudgetRequest, db: Session = Depends(get_db)):
    response = Response()

    try:
        uuid.UUID(request.account_id)
    except ValueError:
        return response.with_error(f"Invalid UUID: {request.account_id}")

    try:
        uuid.UUID(request.id)
    except ValueError:
        return response.with_error(f"Invalid UUID: {request.id}")

    budget = db.query(Budget).filter(Budget.id == request.id).first()
    if budget is None:
        return response.with_error(f"Budget {request.id} not found", status.HTTP_404_NOT_FOUND)

    account = db.query(Account).filter(Account.id == request.account_id).first()
    if account is None:
        return response.with_error(f"Account {request.account_id} not found", status.HTTP_404_NOT_FOUND)

    try:
        datetime.strptime(request.valid_from, "%Y-%m-%d %H:%M:%S%z")
    except ValueError:
        return response.with_error(f"Invalid valid_from: {request.valid_from}")

    try:
        datetime.strptime(request.valid_until, "%Y-%m-%d %H:%M:%S%z")
    except ValueError:
        return response.with_error(f"Invalid valid_until: {request.valid_until}")

    if request.spending_limit <= 0:
        return response.with_error(f"Budget must be greater than zero: {request.spending_limit}")

    budget.valid_from = request.valid_from
    budget.valid_until = request.valid_until
    budget.spending_limit = request.spending_limit
    budget.active = request.active
    budget.name = request.name

    db.commit()
    db.refresh(budget)

    return response.success(budget.to_dict())

@router.get("/accounts/{account_id}")
async def get_budgets(account_id: str, db: Session = Depends(get_db)):
    response = Response()

    try:
        uuid.UUID(account_id)
    except ValueError:
        return response.with_error(f"Invalid UUID: {account_id}")

    account = db.query(Account).filter(Account.id == account_id).first()
    if account is None:
        return response.with_error(f"Account {account_id} not found", status.HTTP_404_NOT_FOUND)

    budgets: List[Budget] = db.query(Budget).filter(Budget.account_id == account_id).all()

    budgets_serialized = [budget.to_dict() for budget in budgets]

    return response.success(budgets_serialized)

@router.get("/{budget_id}")
async def get_budget(budget_id: str, db: Session = Depends(get_db)):
    response = Response()

    try:
        uuid.UUID(budget_id)
    except ValueError:
        return response.with_error(f"Invalid UUID: {budget_id}")

    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if budget is None:
        return response.with_error(f"Budget {budget_id} not found", status.HTTP_404_NOT_FOUND)

    return response.success(budget.to_dict())

@router.delete("/{budget_id}")
async def delete_budget(budget_id: str, db: Session = Depends(get_db)):
    response = Response()

    try:
        uuid.UUID(budget_id)
    except ValueError:
        return response.with_error(f"Invalid UUID: {budget_id}")

    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if budget is None:
        return response.with_error(f"Budget {budget_id} not found", status.HTTP_404_NOT_FOUND)

    db.delete(budget)
    db.commit()

    return response.success(status_code=status.HTTP_204_NO_CONTENT)