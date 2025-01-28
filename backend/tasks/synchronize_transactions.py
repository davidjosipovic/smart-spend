import httpx

from database import SessionLocal
from model.enable_banking.account import Account
from model.enable_banking.transaction import Transaction
from model.users.user import User
from settings import settings
from utils.authorization_key import EnableBankingAuth


async def synchronize_transactions():
    db = SessionLocal()  # Manually create a session
    try:
        users = db.query(User).filter(
            User.eb_session_id.isnot(None)
        ).all()

        headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}

        for user in users:

            accounts = db.query(Account).filter(Account.user_id == user.id).all()

            for account in accounts:

                async with httpx.AsyncClient() as client:
                    eb_response = await client.get(f"{settings.enable_banking_api_url}/accounts/{account.account_id}/transactions", headers=headers)
                    if eb_response.is_error:
                        continue

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

        return "Transactions synchronized"
    finally:
        db.close()