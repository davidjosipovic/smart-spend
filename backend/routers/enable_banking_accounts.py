from fastapi import APIRouter, Depends, Query
import httpx
from sqlalchemy.orm import Session
from starlette import status
from datetime import datetime
from typing import Optional
from sqlalchemy import inspect

from database import get_db
from model.enable_banking.account import Account
from model.enable_banking.balance import Balance
from model.enable_banking.transaction import Transaction
from settings import settings
from model.common.response import Response
from utils.authorization_key import EnableBankingAuth


router = APIRouter(
    tags=["Enable Banking"],
    prefix="/api/enable-banking"
)

@router.get("/accounts/{account_id}")
async def get_account_details(account_id: str, db: Session = Depends(get_db)):
    response = Response()
        
    headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}

    account = db.query(Account).filter(Account.account_id == account_id).first()
    if account is None:
        return response.with_error(f"Account {account_id} not found", status.HTTP_404_NOT_FOUND)
    
    async with httpx.AsyncClient() as client:
        eb_response = await client.get(f"{settings.enable_banking_api_url}/accounts/{account_id}/details", headers=headers)
        if eb_response.is_error:
            return response.with_error(eb_response.json(), eb_response.status_code)

    account.all_account_ids = eb_response.json()["all_account_ids"]
    account.account_servicer = eb_response.json()["account_servicer"]
    account.name = eb_response.json()["name"]
    account.details = eb_response.json()["details"]
    account.usage = eb_response.json()["usage"]
    account.cash_account_type = eb_response.json()["cash_account_type"]
    account.product_type = eb_response.json()["product"]
    account.currency = eb_response.json()["currency"]
    account.psu_status = eb_response.json()["psu_status"]
    account.credit_limit = eb_response.json()["credit_limit"]
    account.uid = eb_response.json()["uid"]
    account.identification_hash = eb_response.json()["identification_hash"]
    account.identification_hashes = eb_response.json()["identification_hashes"]

    db.commit()
    db.refresh(account)
        
    return response.success(eb_response.json())

@router.get("/accounts/{account_id}/balances")
async def get_account_balances(account_id: str, db: Session = Depends(get_db)):
    response = Response()

    headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}

    account = db.query(Account).filter(Account.account_id == account_id).first()
    if account is None:
        return response.with_error(f"Account {account_id} not found", status.HTTP_404_NOT_FOUND)

    async with httpx.AsyncClient() as client:
        eb_response = await client.get(f"{settings.enable_banking_api_url}/accounts/{account_id}/balances", headers=headers)
        if eb_response.is_error:
            return response.with_error(eb_response.json(), eb_response.status_code)

    received_balances = eb_response.json()["balances"]

    persisted_balances = db.query(Balance).filter(Balance.account_id == account.id).all()

    for persisted_balance in persisted_balances:
        db.delete(persisted_balance)
        db.commit()

    for received_balance in received_balances:
        balance = Balance()
        balance.account_id = account.id
        balance.name = received_balance["name"]
        balance.balance_type = received_balance["balance_type"]
        balance.balance_amount = received_balance["balance_amount"]["amount"]
        balance.balance_currency = received_balance["balance_amount"]["currency"]
        balance.last_change_date_time = received_balance["last_change_date_time"]
        balance.last_committed_transaction = received_balance["last_committed_transaction"]
        balance.reference_date = received_balance["reference_date"]
        db.add(balance)
        db.commit()
        db.refresh(balance)

    return response.success(eb_response.json())

@router.get("/accounts/{account_id}/transactions")
async def get_account_transactions(account_id: str, db: Session = Depends(get_db)):
    response = Response()

    headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}

    account = db.query(Account).filter(Account.account_id == account_id).first()
    if account is None:
        return response.with_error(f"Account {account_id} not found", status.HTTP_404_NOT_FOUND)

    async with httpx.AsyncClient() as client:
        eb_response = await client.get(f"{settings.enable_banking_api_url}/accounts/{account_id}/transactions", headers=headers)
        if eb_response.is_error:
            return response.with_error(eb_response.json(), eb_response.status_code)

    received_transactions = eb_response.json()["transactions"]

    for received_transaction in received_transactions:
        if db.query(Transaction).filter(Transaction.reference == (received_transaction["transaction_id"] or received_transaction["entry_reference"])).first() is not None:
            continue

        transaction = Transaction()
        """
        "id": raw_tx.get("transaction_id") or raw_tx.get("entry_reference"),
        "booking_date": raw_tx.get("booking_date"),
        "transaction_date": raw_tx.get("transaction_date"),
        "amount": float(raw_tx["transaction_amount"]["amount"]),
        "currency": raw_tx["transaction_amount"]["currency"],
        "credit_debit_indicator": raw_tx["credit_debit_indicator"],
        "status": raw_tx.get("status"),
        "remittance_information": " ".join(raw_tx.get("remittance_information", [])),
        "merchant_category_code": raw_tx.get("merchant_category_code"),
        "creditor_name": raw_tx.get("creditor", {}).get("name"),
        "debtor_name": raw_tx.get("debtor", {}).get("name"),
        "bank_transaction_code": raw_tx.get("bank_transaction_code", {}).get("code"),
        """
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
        transaction.bank_transaction_code = received_transaction.get("bank_transaction_code", {}).get("code")


        """ transaction.entry_reference = received_transaction["entry_reference"]
        transaction.transaction_amount = received_transaction["transaction_amount"]["amount"]
        transaction.transaction_currency = received_transaction["transaction_amount"]["currency"]
        transaction.account_id = account.id
        transaction.booking_date = received_transaction["booking_date"]
        transaction.status = received_transaction["status"]
        transaction.creditor_name = received_transaction["creditor"]["name"]
        transaction.credit_debit_indicator = received_transaction["credit_debit_indicator"] """
        db.add(transaction)
        db.commit()
        db.refresh(transaction)

    return response.success(eb_response.json())

@router.get("/accounts/{account_id}/saved-transactions")
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