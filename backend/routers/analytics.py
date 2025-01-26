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

    # Fetch transactions in a single query
    transactions = (
        db.query(Transaction.booking_date, Transaction.transaction_amount, Transaction.credit_debit_indicator)
        .filter(Transaction.account_id == id)
        .all()
    )

    # Group and calculate analytics
    analytics_data = {"debits": {}, "credits": {}}
    for booking_date, amount, indicator in transactions:
        day = booking_date
        amount = float(amount)
        key = "debits" if indicator == "DBIT" else "credits"
        if day not in analytics_data[key]:
            analytics_data[key][day] = 0
        analytics_data[key][day] += amount

    # Format the response
    analytics_result = {
        "debits": [{"day": day, "total_spent": total} for day, total in analytics_data["debits"].items()],
        "credits": [{"day": day, "total_income": total} for day, total in analytics_data["credits"].items()],
    }

    return response.success(analytics_result)
