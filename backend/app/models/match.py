from sqlmodel import SQLModel, Field
import uuid
from datetime import datetime

class Match(SQLModel, table=True):
    __tablename__ = "matches"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    winner_id: uuid.UUID
    loser_id: uuid.UUID
    winner_elo_before: int
    winner_elo_after: int
    loser_elo_before: int
    loser_elo_after: int
    location_country: str | None = None
    location_city: str | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)