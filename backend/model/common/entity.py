from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class Entity(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_on: datetime = Field(default_factory=datetime.now)