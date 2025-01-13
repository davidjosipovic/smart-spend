from fastapi import APIRouter
import httpx

from settings import settings
from model.common.response import Response
from utils.authorization_key import EnableBankingAuth


router = APIRouter(
    tags=["Enable Banking"],
    prefix="/api/enable-banking"
)

@router.get("/accounts/{account_id}")
async def get_account_details(account_id: str):
    response = Response()
        
    headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}
    
    async with httpx.AsyncClient() as client:
        eb_response = await client.get(f"{settings.enable_banking_api_url}/accounts/{account_id}/details", headers=headers)
        if eb_response.is_error:
            return response.with_error(eb_response.json(), eb_response.status_code)    
        
    return response.success(eb_response.json())