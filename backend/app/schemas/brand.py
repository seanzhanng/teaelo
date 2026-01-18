from pydantic import BaseModel
from typing import Optional, List
from datetime import date
import uuid

class BrandBase(BaseModel):
    name: str
    description: str | None = None
    website_url: str | None = None
    logo_url: str | None = None
    country_of_origin: str | None = None
    established_date: date | None = None
    price_category: int | None = None
    regions_present: list[str] = []
    countries_active: list[str] = []
    total_locations: int | None = 0 

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    regions_present: Optional[list[str]] = None
    countries_active: Optional[list[str]] = None
    total_locations: Optional[int] = None

class BrandRead(BrandBase):
    id: uuid.UUID
    elo: int
    wins: int
    losses: int
    ties: int = 0
    tier: str
    rank: int | None = None

    class Config:
        from_attributes = True