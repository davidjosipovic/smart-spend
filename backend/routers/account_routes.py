from model.common.response import Response
from model.enable_banking.account import Account
from utils.jwt_generator import JwtGenerator
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter(
    tags=["Accounts"],
    prefix="/api/accounts"
)

@router.get("/")
async def get_user_accounts(user_id: str = Depends(JwtGenerator.get_current_user_id), db: Session = Depends(get_db)):
    response = Response()
    
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    accounts_data = [account.to_dict() for account in accounts]
    
    return response.success(accounts_data)