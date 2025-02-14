from datetime import datetime
from sqlalchemy import Column, DateTime, UUID, MetaData
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.declarative import as_declarative, declared_attr
import uuid

# Define custom metadata
metadata = MetaData()

@as_declarative(metadata=metadata)
class Entity:
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    created_on: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_on: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

    def to_dict(self):
        result = {}
        for key, value in self.__dict__.items():
            if key.startswith('_'):
                continue
            if isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, uuid.UUID):
                result[key] = str(value)
            else:
                result[key] = value
        return result