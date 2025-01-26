from fastapi import APIRouter

router = APIRouter(
    tags=["Tasks"],
    prefix="/api"
)

@router.get("/fetch-transactions")
async def fetch_transactions():
    return {"message": "Task triggered"}