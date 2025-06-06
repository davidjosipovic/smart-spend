import logging
from datetime import datetime
from typing import Optional
import csv

from utils.authorization_key import EnableBankingAuth
from celery_config import classify_transactions_task
import httpx
from sqlalchemy.orm.session import Session
from starlette import status

from model.common.response import Response
from fastapi import APIRouter, Depends, UploadFile, File, Query
from database import get_db

from model.enable_banking.account import Account
from model.enable_banking.transaction import Transaction
from settings import settings
from tasks.ml_tasks import classify_transactions

router = APIRouter(
    tags=["Transactions"],
    prefix="/api/transactions"
)

logger = logging.getLogger(__name__)

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
            "bank_transaction_code": transaction.bank_transaction_code,
            "category": transaction.category,  # ML-classified category
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

@router.get("/accounts/{account_id}/synchronize-transactions/", response_model=Response, summary="Synchronize transactions with EB")
async def synchronize_transactions(db: Session = Depends(get_db)):
    response = Response()

    account = db.query(Account).filter(Account.account_id == Account.account_id).first()
    if account is None:
        return response.success("Account not found", status.HTTP_404_NOT_FOUND)

    should_continue = True
    continuation_key = None
    iterations = 0
    
    headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}

    new_transaction_ids = []

    while should_continue:
        async with httpx.AsyncClient() as client:
            eb_response = await client.get(f"{settings.enable_banking_api_url}/accounts/{account.account_id}/transactions", headers=headers, params={"continuation_key": continuation_key})
            if eb_response.is_error:
                break

        received_transactions = eb_response.json()["transactions"]

        for received_transaction in received_transactions:
            if db.query(Transaction).filter(Transaction.reference == (received_transaction["transaction_id"] or received_transaction["entry_reference"])).first() is not None:
                break

            transaction = Transaction()
            transaction.reference = received_transaction["transaction_id"] or received_transaction["entry_reference"]
            transaction.booking_date = received_transaction["booking_date"]
            transaction.transaction_date = received_transaction["transaction_date"]
            transaction.amount = float(received_transaction["transaction_amount"]["amount"])
            transaction.currency = received_transaction["transaction_amount"]["currency"]
            transaction.credit_debit_indicator = received_transaction["credit_debit_indicator"]
            transaction.status = received_transaction["status"]
            transaction.remittance_information = " ".join(received_transaction.get("remittance_information", []))
            transaction.merchant_category_code = received_transaction.get("merchant_category_code")
            transaction.creditor_name = received_transaction.get("creditor", {}).get("name")
            transaction.debtor_name = received_transaction.get("debtor", {}).get("name")
            transaction.account_id = account.id
            db.add(transaction)
            db.commit()
            db.refresh(transaction)
            new_transaction_ids.append(str(transaction.id))

        iterations += 1
        logger.info(f"Successfuly synchronized {len(received_transactions)} transactions in {iterations}. iteration")

        if eb_response.json()["continuation_key"] is not None:
            continuation_key = eb_response.json()["continuation_key"]
        else:
            should_continue = False

    classify_transactions_task.delay(new_transaction_ids)

    return response.success(f"Synchronized and classified {len(new_transaction_ids)} transactions.")

@router.post("/accounts/{account_id}/import-transactions", response_model=Response, summary="Import transactions from file")
async def import_transactions(
    account_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    response = Response()
    
    # Verify account exists
    account = db.query(Account).filter(Account.account_id == account_id).first()
    if account is None:
        return response.with_error(f"Account {account_id} not found", status.HTTP_404_NOT_FOUND)
    
    if not file.filename.endswith('.csv'):
        return response.with_error("Only CSV files are supported", status.HTTP_400_BAD_REQUEST)
    
    try:
        # Read and parse CSV file
        contents = await file.read()
        csv_data = contents.decode('utf-8').splitlines()
        reader = csv.DictReader(csv_data)
        
        # Validate required fields
        required_fields = {'reference', 'remittance_information', 'amount'}
        if not all(field in reader.fieldnames for field in required_fields):
            return response.with_error(
                f"CSV must contain the following fields: {', '.join(required_fields)}",
                status.HTTP_400_BAD_REQUEST
            )
        
        new_transaction_ids = []
        for row in reader:
            # Check if transaction already exists
            if db.query(Transaction).filter(Transaction.reference == row['reference']).first() is not None:
                continue
                
            # Create new transaction
            transaction = Transaction()
            transaction.reference = row['reference']
            transaction.remittance_information = row['remittance_information']
            transaction.amount = float(row['amount'])
            transaction.account_id = account.id
            transaction.booking_date = datetime.now()  # Default to current date
            transaction.transaction_date = datetime.now()  # Default to current date
            transaction.currency = 'EUR'  # Default currency
            transaction.status = 'BOOKED'  # Default status
            
            db.add(transaction)
            db.commit()
            db.refresh(transaction)
            new_transaction_ids.append(str(transaction.id))
        
        # Classify the newly imported transactions
        if new_transaction_ids:
            classify_transactions_task.delay(new_transaction_ids)
            
        return response.success(f"Successfully imported {len(new_transaction_ids)} transactions")
        
    except Exception as e:
        logger.error(f"Error importing transactions: {str(e)}")
        return response.with_error("Failed to import transactions", status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.post("/accounts/{account_id}/insert-transaction", response_model=Response, summary="Insert transaction")
async def insert_transaction(
    account_id: str,
    transaction_data: dict,
    db: Session = Depends(get_db)
):
    response = Response()
    
    # Verify account exists
    account = db.query(Account).filter(Account.account_id == account_id).first()
    if account is None:
        return response.with_error(f"Account {account_id} not found", status.HTTP_404_NOT_FOUND)
    
    # Validate required fields
    required_fields = {'reference', 'remittance_information', 'amount'}
    if not all(field in transaction_data for field in required_fields):
        return response.with_error(
            f"Transaction must contain the following fields: {', '.join(required_fields)}",
            status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Check if transaction already exists
        if db.query(Transaction).filter(Transaction.reference == transaction_data['reference']).first() is not None:
            return response.with_error("Transaction with this reference already exists", status.HTTP_400_BAD_REQUEST)
        
        # Create new transaction
        transaction = Transaction()
        transaction.reference = transaction_data['reference']
        transaction.remittance_information = transaction_data['remittance_information']
        transaction.amount = float(transaction_data['amount'])
        transaction.account_id = account.id
        transaction.booking_date = datetime.now()  # Default to current date
        transaction.transaction_date = datetime.now()  # Default to current date
        transaction.currency = transaction_data.get('currency', 'EUR')  # Default to EUR if not provided
        transaction.status = transaction_data.get('status', 'BOOKED')  # Default to BOOKED if not provided
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        # Classify the newly inserted transaction
        classify_transactions_task.delay([str(transaction.id)])
        
        return response.success(transaction.id)
        
    except Exception as e:
        logger.error(f"Error inserting transaction: {str(e)}")
        return response.with_error("Failed to insert transaction", status.HTTP_500_INTERNAL_SERVER_ERROR)