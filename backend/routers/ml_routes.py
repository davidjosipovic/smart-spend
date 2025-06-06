from celery_config import classify_transactions_task
from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter(
    prefix="/ml",
    tags=["Machine Learning"]
)

@router.post("/classify-transactions")
async def trigger_transaction_classification(transaction_ids: List[str]):
    """
    Trigger classification of a batch of transactions.
    
    Args:
        transaction_ids: List of transaction IDs to classify
        
    Returns:
        dict: Message indicating the task has been triggered
    """
    try:
        # Trigger the Celery task asynchronously
        classify_transactions_task.delay(transaction_ids)
        return {"message": "Transaction classification task has been triggered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
