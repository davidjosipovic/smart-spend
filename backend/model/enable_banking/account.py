from sqlalchemy import ARRAY, Column, String, Text, ForeignKey, UUID
from sqlalchemy.orm import relationship

from model.common.entity import Entity


class Account(Entity):
    account_id = Column(String, nullable=False)
    all_account_ids = Column(ARRAY(String), nullable=True)
    account_servicer = Column(String, nullable=True)
    name = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    usage = Column(String, nullable=True)
    cash_account_type = Column(String, nullable=True)
    product = Column(String, nullable=True)
    currency = Column(String, nullable=True)
    psu_status = Column(String, nullable=True)
    credit_limit = Column(String, nullable=True)
    uid = Column(String, nullable=True)
    identification_hash = Column(String, nullable=True)
    identification_hashes = Column(ARRAY(String), nullable=True)

    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)
    user = relationship("User", backref="accounts")