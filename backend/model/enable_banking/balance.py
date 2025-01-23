from sqlalchemy import String, Column, DateTime, UUID, ForeignKey
from sqlalchemy.orm import relationship

from model.common.entity import Entity

class Balance(Entity):
    name = Column(String, nullable=False)
    balance_currency = Column(String, nullable=False)
    balance_amount = Column(String, nullable=False)
    balance_type = Column(String, nullable=False)
    last_change_date_time = Column(String, nullable=True)
    reference_date = Column(String, nullable=True)
    last_committed_transaction = Column(String, nullable=True)

    account_id = Column(UUID(as_uuid=True), ForeignKey('account.id'), nullable=False)
    account = relationship("Account", backref="balances")