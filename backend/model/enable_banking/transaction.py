from sqlalchemy import Column, String, UUID, ForeignKey
from sqlalchemy.orm import relationship

from model.common.entity import Entity


class Transaction(Entity):
    entry_reference = Column(String, nullable=False)
    transaction_amount = Column(String, nullable=False)
    transaction_currency = Column(String, nullable=False)
    creditor_name = Column(String, nullable=True)
    credit_debit_indicator = Column(String, nullable=True)
    status = Column(String, nullable=True)
    booking_date = Column(String, nullable=True)

    account_id = Column(UUID(as_uuid=True), ForeignKey('account.id'), nullable=False)
    account = relationship("Account", backref="transactions")