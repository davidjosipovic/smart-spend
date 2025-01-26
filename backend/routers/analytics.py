from fastapi import APIRouter, Depends

from model.common.response import Response
from model.enable_banking.account import Account
from sqlalchemy.orm import Session
from starlette import status
from database import get_db
from model.enable_banking.transaction import Transaction



router = APIRouter(
    tags=["Analytics"],
    prefix="/api"
)

@router.get("/accounts/{id}/analytics")
async def get_account_analytics(id: str, db: Session = Depends(get_db)):
    """
    Returns the total spending (debits) and total income (credits) grouped by day for the given account.
    """
    response = Response()

    # Check if the account exists
    account = db.query(Account).filter(Account.id == id).first()
    if account is None:
        return response.with_error(f"Account {id} not found", status.HTTP_404_NOT_FOUND)

    # Query debit transactions for the account
    debit_transactions = (
        db.query(Transaction.booking_date, Transaction.transaction_amount)
        .filter(
            Transaction.account_id == id,  # Ensure this matches the correct column
            Transaction.credit_debit_indicator == "DBIT"
        )
        .all()
    )

    # Query credit transactions for the account
    credit_transactions = (
        db.query(Transaction.booking_date, Transaction.transaction_amount)
        .filter(
            Transaction.account_id == id,  # Ensure this matches the correct column
            Transaction.credit_debit_indicator == "CRDT"
        )
        .all()
    )

    # Group transactions by day and calculate total spending/income
    analytics_data = {"debits": {}, "credits": {}}

    # Process debit transactions
    for booking_date, amount in debit_transactions:
        day = str(booking_date)  # Convert date to string format
        amount = float(amount)  # Convert amount to a numeric type
        if day not in analytics_data["debits"]:
            analytics_data["debits"][day] = 0
        analytics_data["debits"][day] += amount

    # Process credit transactions
    for booking_date, amount in credit_transactions:
        day = str(booking_date)  # Convert date to string format
        amount = float(amount)  # Convert amount to a numeric type
        if day not in analytics_data["credits"]:
            analytics_data["credits"][day] = 0
        analytics_data["credits"][day] += amount

    # Format the response
    analytics_result = {
        "debits": [{"day": day, "total_spent": total} for day, total in analytics_data["debits"].items()],
        "credits": [{"day": day, "total_income": total} for day, total in analytics_data["credits"].items()],
    }

    return response.success(analytics_result)
