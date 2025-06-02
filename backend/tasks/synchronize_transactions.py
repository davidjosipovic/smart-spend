import httpx

from database import SessionLocal
from model.enable_banking.account import Account
from model.enable_banking.transaction import Transaction
from model.users.user import User
from sqlalchemy.orm import Session
from settings import settings
from utils.authorization_key import EnableBankingAuth


async def synchronize_transactions(providedDb: Session):
    db = providedDb
    if db is None:
        db = SessionLocal()
    try:
        users = db.query(User).filter(
            User.eb_session_id.isnot(None)
        ).all()

        headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}

        for user in users:

            accounts = db.query(Account).filter(Account.user_id == user.id).all()

            for account in accounts:

                should_continue = True
                continuation_key = None
                iterations = 0

                while should_continue:
                    async with httpx.AsyncClient() as client:
                        eb_response = await client.get(f"{settings.enable_banking_api_url}/accounts/{account.account_id}/transactions", headers=headers, params={"continuation_key": continuation_key})
                        if eb_response.is_error:
                            continue

                    received_transactions = eb_response.json()["transactions"]

                    for received_transaction in received_transactions:
                        if db.query(Transaction).filter(Transaction.reference == (received_transaction["transaction_id"] or received_transaction["entry_reference"])).first() is not None:
                            continue

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

                    iterations += 1
                    print(f"Successfuly synchronized {len(received_transactions)} transactions in {iterations}. iteration")
                    
                    if eb_response.json()["continuation_key"] is not None:
                        continuation_key = eb_response.json()["continuation_key"]
                    else:
                        should_continue = False


        return "Transactions synchronized"
    finally:
        if providedDb is None:
            db.close()