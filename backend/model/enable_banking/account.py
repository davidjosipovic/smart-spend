from sqlalchemy import ARRAY, Column, String, Text
from model.common.entity import Entity

class Account(Entity):
    account_id = Column(String, nullable=True)
    all_account_ids = Column(ARRAY(String), nullable=True)
    account_servicer = Column(String, nullable=True)
    name = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    usage = Column(String, nullable=True)
    cash_account_type = Column(String, nullable=True)
    product = Column(String, nullable=True)
    currency = Column(String, nullable=False)
    psu_status = Column(String, nullable=True)
    credit_limit = Column(String, nullable=True)
    uid = Column(String, nullable=False)
    identification_hash = Column(String, nullable=False)
    identification_hashes = Column(ARRAY(String), nullable=True)