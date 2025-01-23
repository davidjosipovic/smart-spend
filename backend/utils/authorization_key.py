from settings import settings
import os
from datetime import datetime
import jwt as pyjwt

class EnableBankingAuth:
    @staticmethod
    def get_enable_banking_jwt():
        iat = int(datetime.now().timestamp())
        jwt_body = {
            "iss": "enablebanking.com",
            "aud": "api.enablebanking.com",
            "iat": iat,
            "exp": iat + 3600,
        }
        jwt = pyjwt.encode(
            jwt_body,
            open(settings.enable_banking_key_path, "rb").read(),
            algorithm="RS256",
            headers={"kid": settings.enable_banking_application_id},
        )
        return jwt