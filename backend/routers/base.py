from fastapi import APIRouter

router = APIRouter(
    tags=["Base"]
)

@router.get("/ping")
async def ping_api() -> str:
    return "API is working."