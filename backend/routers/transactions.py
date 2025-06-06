from datetime import datetime
from typing import Optional
from backend.model.common.response import Response
from fastapi import APIRouter, Depends
from database import get_db

router = APIRouter(
    tags=["Transactions"],
    prefix="/api/transactions"
)

@router.get("/accounts/{account_id}/", response_model=Response, summary="Get saved transactions for an account")
async def get_saved_transactions(
    account_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    date_from: Optional[datetime] = Query(None, description="Filter transactions from this date"),
    date_until: Optional[datetime] = Query(None, description="Filter transactions until this date"),
    db: Session = Depends(get_db)
):
    response = Response()

    account = db.query(Account).filter(Account.account_id == account_id).first()
    if account is None:
        return response.with_error(f"Account {account_id} not found", status.HTTP_404_NOT_FOUND)

    # Build the base query
    query = db.query(Transaction).filter(Transaction.account_id == account.id)

    # Apply date filters if provided
    if date_from:
        query = query.filter(Transaction.booking_date >= date_from)
    if date_until:
        query = query.filter(Transaction.booking_date <= date_until)

    # Calculate total count for pagination
    total_count = query.count()

    # Apply pagination
    transactions = query.order_by(Transaction.booking_date.desc()) \
        .offset((page - 1) * page_size) \
        .limit(page_size) \
        .all()

    # Convert transactions to dictionaries, excluding SQLAlchemy state
    transaction_dicts = []
    for transaction in transactions:
        transaction_dict = {
            "reference": transaction.reference, 
            "booking_date": transaction.booking_date,
            "transaction_date": transaction.transaction_date,
            "amount": transaction.amount,
            "currency": transaction.currency,
            "credit_debit_indicator": transaction.credit_debit_indicator,
            "status": transaction.status,
            "remittance_information": transaction.remittance_information,
            "merchant_category_code": transaction.merchant_category_code,
            "creditor_name": transaction.creditor_name,
            "debtor_name": transaction.debtor_name,
            "bank_transaction_code": transaction.bank_transaction_code
        }
        transaction_dicts.append(transaction_dict)

    # Format the response
    result = {
        "transactions": transaction_dicts,
        "pagination": {
            "current_page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": (total_count + page_size - 1) // page_size
        }
    }

    return response.success(result)