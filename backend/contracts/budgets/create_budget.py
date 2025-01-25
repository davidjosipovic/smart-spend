from pydantic import BaseModel

class CreateBudgetRequest(BaseModel):
    name: str
    valid_from: str
    valid_until: str
    spending_limit: float
    account_id: str