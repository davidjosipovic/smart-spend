from pydantic import BaseModel

class AuthenticateUser(BaseModel):
    emailAddressOrUsername: str
    password: str
    rememberMe: bool