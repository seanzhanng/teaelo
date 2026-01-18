from pydantic import BaseModel
from typing import Any, Optional

# A generic response wrapper
class StandardResponse(BaseModel):
    ok: bool = True
    message: str = "Success"