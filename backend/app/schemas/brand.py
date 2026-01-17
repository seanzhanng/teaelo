from pydantic import BaseModel
from typing import Optional, List
import uuid

class BrandBase(BaseModel):
    name: str
    website: str | None = None
    regions_present: list[str] = []
    countries_active: list[str] = []

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    regions_present: Optional[list[str]] = None
    countries_active: Optional[list[str]] = None

class BrandRead(BrandBase):
    id: uuid.UUID
    elo: int
    wins: int
    losses: int
    tier: str
    
    class Config:
        from_attributes = True