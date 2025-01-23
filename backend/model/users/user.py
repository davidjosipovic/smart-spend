from model.common.entity import Entity
from sqlalchemy import Column, String

class User(Entity):
    name: str = Column(String, nullable=False)
    username: str = Column(String, unique=True, nullable=False)
    email: str = Column(String, unique=True, nullable=False)
    password: str = Column(String, nullable=False)
    eb_session_id: str = Column(String, nullable=True)
    valid_until: str = Column(String, nullable=True)