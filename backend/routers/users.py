from utils.encrypt_password import PasswordUtils
from utils.jwt_generator import JwtGenerator
from contracts.users.authenticate_user import AuthenticateUser
from contracts.users.create_or_update_user import CreateOrUpdateUser
from database import get_db
from fastapi import APIRouter, Depends
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

    user = db.query(User).filter(User.email == request.emailAddress or User.username == request.username).first()
    if user:
        return response.with_error("Email or username is already registered.")

    new_user = User(
        name=request.name,
        email=request.emailAddress,
        username=request.username,
        password=PasswordUtils.encrypt_password(request.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
async def login(request: AuthenticateUser, db: Session = Depends(get_db)):
    response = Response()
    
    user = db.query(User).filter(User.email == request.emailAddressOrUsername or User.username == request.emailAddressOrUsername).first()
    if not user:
        return response.with_error("User with such email address or username does not exist.")
    
    if user.password != PasswordUtils.encrypt_password(request.password):
        return response.with_error("Password is incorrect.")
    
    return response.success(JwtGenerator.generate(user, request.rememberMe))

##NOTE: Password resetting is for phase 2 when we implement email sending
#@router.post("/request-password-reset")
#async def request_password_reset():
#    pass
#
#@router.post("/reset-password")
#async def reset_password():
#    pass