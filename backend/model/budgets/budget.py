from sqlalchemy import Column, ForeignKey, UUID, String, Float, Boolean
from sqlalchemy.orm import relationship

from model.common.entity import Entity

class Budget(Entity):
    name = Column(String)
    valid_from = Column(String, nullable=False)
    valid_until = Column(String, nullable=False)
    spending_limit = Column(Float, nullable=False)
    active = Column(Boolean, nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey('account.id'), nullable=False)
    account = relationship("Account", backref="budgets")