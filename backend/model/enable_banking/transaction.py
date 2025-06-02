from sqlalchemy import Column, String, UUID, ForeignKey, Float
from sqlalchemy.orm import relationship

from model.common.entity import Entity


class Transaction(Entity):
    reference = Column(String, nullable=False)
    booking_date = Column(String, nullable=False)
    transaction_date = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    credit_debit_indicator = Column(String, nullable=True)
    status = Column(String, nullable=True)
    remittance_information = Column(String, nullable=True)
    merchant_category_code = Column(String, nullable=True)
    creditor_name = Column(String, nullable=True)
    debtor_name = Column(String, nullable=True)
    bank_transaction_code = Column(String, nullable=True)

    account_id = Column(UUID(as_uuid=True), ForeignKey('account.id'), nullable=False)
    account = relationship("Account", backref="transactions")