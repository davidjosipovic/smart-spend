from fastapi import APIRouter, Depends
from database import get_db
from sqlalchemy.orm import Session
from tasks.synchronize_transactions import synchronize_transactions

router = APIRouter(
    tags=["Tasks"],
    prefix="/api"
)

@router.get("/fetch-transactions")
async def fetch_transactions(db: Session = Depends(get_db)):
    return await synchronize_transactions(db)