from fastapi import APIRouter, Depends
import httpx
from sqlalchemy.orm import Session
from starlette import status

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
        if db.query(Transaction).filter(Transaction.entry_reference == received_transaction["entry_reference"]).first() is not None:
            continue

        transaction = Transaction()
        transaction.entry_reference = received_transaction["entry_reference"]
        transaction.transaction_amount = received_transaction["transaction_amount"]["amount"]
        transaction.transaction_currency = received_transaction["transaction_amount"]["currency"]
        transaction.account_id = account.id
        transaction.booking_date = received_transaction["booking_date"]
        transaction.status = received_transaction["status"]
        transaction.creditor_name = received_transaction["creditor"]["name"]
        transaction.credit_debit_indicator = received_transaction["credit_debit_indicator"]
        db.add(transaction)
        db.commit()
        db.refresh(transaction)

    return response.success(eb_response.json())