from fastapi import APIRouter, Depends, Query
import httpx
from utils.jwt_generator import JwtGenerator
from contracts.enable_banking.start_authorization_request import Access, Aspsp, StartAuthorizationRequest
from utils.authorization_key import EnableBankingAuth
from model.common.response import Response
from datetime import datetime, timedelta
import pytz
from settings import settings

router = APIRouter(
    tags=["Enable Banking"],
    prefix="/api/enable-banking"
)

@router.get("/aspsps")
async def get_aspsps_list(country: str = Query(default="hr", max_length=2)):
    response = Response()
        
    params = {"country": country.upper()}
    headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}
    
    async with httpx.AsyncClient() as client:
        eb_response = await client.get(f"{settings.enable_banking_api_url}/aspsps", headers=headers, params=params)
        if eb_response.is_error:
            return response.with_error(eb_response.json(), eb_response.status_code)    
        
    return response.success(eb_response.json())

@router.get("/application")
async def get_application():
    response = Response()
        
    headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}
    
    async with httpx.AsyncClient() as client:
        eb_response = await client.get(f"{settings.enable_banking_api_url}/application", headers=headers)
        if eb_response.is_error:
            return response.with_error(eb_response.json(), eb_response.status_code)    
        
    return response.success(eb_response.json())
            
@router.post("/user-authorization")
async def start_user_authorization(aspsp: Aspsp, user_id: str = Depends(JwtGenerator.get_current_user_id)):
    response = Response()
        
    payload = {
        "access": {
            "valid_until": (datetime.now() + timedelta(days=7)).replace(tzinfo=pytz.timezone("Europe/Zagreb")).isoformat(),
            "balances": True,
            "transactions": True
        },
        "aspsp": aspsp.model_dump(),
        "redirect_url": "http://localhost:3000/callback",
        "psu_type": "personal",
        "psu_id": user_id,
        "state": user_id
    }
    
    headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}
    async with httpx.AsyncClient() as client:
        eb_response = await client.post(f"{settings.enable_banking_api_url}/auth", headers=headers, json=payload,)
        if eb_response.is_error:
            return response.with_error(eb_response.json(), eb_response.status_code)    
    
    return response.success(eb_response.json())

@router.post("/authorize-session")
async def authorize_user_session(authorization_code: str):
    response = Response()
    
    payload = {
        "code": authorization_code
    }
    
    headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}
    
    async with httpx.AsyncClient() as client:
        eb_response = await client.post(f"{settings.enable_banking_api_url}/sessions", headers=headers, json=payload,)
        if eb_response.is_error:
            return response.with_error(eb_response.json(), eb_response.status_code)    
        
    session_id = eb_response.json()["session_id"]
    valid_until = eb_response.json()["access"]["valid_until"]
    
    return response.success(eb_response.json())

@router.get("/session/{session_id}")
async def get_session_data(session_id: str):
    response = Response()
        
    headers = {"Authorization": f"Bearer {EnableBankingAuth.get_enable_banking_jwt()}"}
    
    async with httpx.AsyncClient() as client:
        eb_response = await client.get(f"{settings.enable_banking_api_url}/sessions/{session_id}", headers=headers)
        if eb_response.is_error:
            return response.with_error(eb_response.json(), eb_response.status_code)    
        
    return response.success(eb_response.json())