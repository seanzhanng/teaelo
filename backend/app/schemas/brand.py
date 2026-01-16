from pydantic import BaseModel
from typing import Optional
import uuid

class BrandBase(BaseModel):
    name: str
    slug: str
    website: str | None = None
    regions_present: list[str] = []

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    regions_present: Optional[list[str]] = None

class BrandRead(BrandBase):
    id: uuid.UUID
    elo: int
    wins: int
    losses: int
    
    class Config:
        from_attributes = True