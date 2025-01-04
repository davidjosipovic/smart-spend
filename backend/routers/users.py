from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from contracts.users.create_or_update_user import CreateOrUpdateUser
import json

router = APIRouter(
    tags=["Users"],
    prefix="/api"
)

@router.post("/register")
async def register(request: CreateOrUpdateUser, db: Session = Depends(get_db)):
    return request

#@router.post("/login")
#async def login():
#    pass
#
##NOTE: Password resetting is for phase 2 when we implement email sending
#@router.post("/request-password-reset")
#async def request_password_reset():
#    pass
#
#@router.post("/reset-password")
#async def reset_password():
#    pass