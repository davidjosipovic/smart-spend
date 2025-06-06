from pydantic import BaseModel
from typing import Union

class AccountIdentification(BaseModel):
    iban: str

class Access(BaseModel):
    accounts: Union[list[AccountIdentification], None] = None
    balances: Union[bool, None] = None
    transactions: Union[bool, None] = None
    valid_until: str

class Aspsp(BaseModel):
    name: str = "Mock ASPSP"
    country: str = "HR"

class StartAuthorizationRequest(BaseModel):
    access: Access
    aspsp: Aspsp
    state: str
    redirect_url: str
    auth_method: str
    psu_type: str
    psu_id: str
    

    