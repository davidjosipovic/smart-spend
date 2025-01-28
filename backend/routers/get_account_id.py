from fastapi import APIRouter, HTTPException,Depends
from sqlalchemy.orm import Session
from model.enable_banking.account import Account
from database import get_db  # This should be your function to get the DB session

router = APIRouter(
    tags=["Get account_id"],
    prefix="/api"
)


@router.get("/accounts/user/{user_id}", response_model=dict)
async def get_account_by_user_id(user_id: str, db: Session = Depends(get_db)):
    # Query the database to get the account_id for the given user_id
    account = db.query(Account).filter(Account.user_id == user_id).first()
    
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found for this user")
    
    # Return the account_id
    return {"account_id": account.account_id}
