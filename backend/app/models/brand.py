import uuid
from datetime import date
from typing import List, Optional
from sqlmodel import Field, SQLModel, JSON
from sqlalchemy import Column

class Brand(SQLModel, table=True):
    __tablename__ = "brands"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)    
    name: str
    description: str | None = None
    website_url: str | None = None
    logo_url: str | None = None
    country_of_origin: str | None = None
    established_date: date | None = None
    total_locations: int | None = 0
    regions_present: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    elo: int = Field(default=1200, index=True)
    tier: str = Field(default="Unranked")
    wins: int = 0
    losses: int = 0
    ties: int = 0
    elo_trend: float = 0.0
    rank_trend: int = 0