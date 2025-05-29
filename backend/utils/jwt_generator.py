from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt as pyjwt
from settings.settings import settings

from model.users.user import User

auth_scheme = HTTPBearer()

class JwtGenerator:
    @staticmethod
    def generate(user: User, remember_me: bool) -> str:
        payload = {
        'id': str(user.id),
        'name': user.name,
        'sessionId': user.eb_session_id,
        'sessionValidUntil': user.valid_until,
        'exp': datetime.now() + timedelta(hours=7 * 24 if remember_me else 1)
        }

        token = pyjwt.encode(payload, settings.jwt_secret_key, algorithm='HS256')

        return token
    
    @staticmethod
    def verify_token(token: HTTPAuthorizationCredentials):
        try:
            payload = pyjwt.decode(token.credentials, settings.jwt_secret_key, algorithms=['HS256'])
            return payload
        except pyjwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    @staticmethod
    def get_current_user_id(token: str = Depends(auth_scheme)):
        payload = JwtGenerator.verify_token(token)
        return payload.get("id")