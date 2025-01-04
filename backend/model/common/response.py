from typing import Any, List

from fastapi.responses import ORJSONResponse
from pydantic import BaseModel, Field

class Response(BaseModel):
    result: Any = None
    errors: List[str] = Field(default_factory=list)
    
    def add_error(self, error: str):
        self.errors.append(error)
    
    def with_error(self, error: str, status_code: int = 400) -> ORJSONResponse:
        self.errors.append(error)
        return ORJSONResponse(content=self.model_dump(), status_code=status_code)
    
    def success(self, result: Any = None, status_code: int = 200) -> ORJSONResponse:
        self.result = result
        return ORJSONResponse(content=self.model_dump(), status_code=status_code)