from datetime import datetime, timedelta
import jwt as pyjwt
from settings import settings

from model.users.user import User

class JwtGenerator:
    @staticmethod
    def generate(user: User, remember_me: bool) -> str:
        payload = {
        'id': str(user.id),
        'name': user.name,
        'exp': datetime.now() + timedelta(hours=7 * 24 if remember_me else 1)
        }

        token = pyjwt.encode(payload, settings.jwt_secret_key, algorithm='HS256')

        return token