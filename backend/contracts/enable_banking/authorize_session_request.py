from pydantic import BaseModel


class AuthorizeSessionRequest(BaseModel):
    user_id: str
    authorization_code: str