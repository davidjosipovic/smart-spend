from fastapi import APIRouter, Query
import httpx
from utils.authorization_key import EnableBankingAuth
from model.common.response import Response

from settings import settings

router = APIRouter(
    tags=["Enable Banking"],
    prefix="/api"
)

@router.get("/enable-banking/aspsps")
async def get_aspsps_list(country: str = Query(default="hr", max_length=2)):
    response = Response()
        
    params = {"country": country.upper()}
    headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}
    
    async with httpx.AsyncClient() as client:
        eb_response = await client.get(f"{settings.enable_banking_api_url}/aspsps", headers=headers, params=params)
        if eb_response.is_error:
            return response.with_error(eb_response.json())    
        
    return response.success(eb_response.json())
            
        