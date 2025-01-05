from contracts.users.create_or_update_user import CreateOrUpdateUser
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from model.users.user import User
from model.common.response import Response
from sqlalchemy.orm import Session

router = APIRouter(
    tags=["Users"],
    prefix="/api"
)

@router.post("/register")
async def register(request: CreateOrUpdateUser, db: Session = Depends(get_db)):
    response = Response()

    db_user = db.query(User).filter(User.email == request.emailAddress or User.username == request.username).first()
    if db_user:
        return response.with_error("Email or username is already registered.")

    new_user = User(
        name=request.name,
        email=request.emailAddress,
        username=request.username,
        password=request.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

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