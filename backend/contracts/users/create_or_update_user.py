from pydantic import BaseModel

class CreateOrUpdateUser(BaseModel):
    name: str
    username: str
    emailAddress: str
    password: str