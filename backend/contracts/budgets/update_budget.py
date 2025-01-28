from pydantic import BaseModel

class UpdateBudgetRequest(BaseModel):
    id: str
    name: str
    valid_from: str
    valid_until: str
    spending_limit: float
    active: bool
    account_id: str