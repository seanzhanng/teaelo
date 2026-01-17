from pydantic import BaseModel
from typing import Optional
import uuid

class MatchCreate(BaseModel):
    winner_id: uuid.UUID
    loser_id: uuid.UUID
    user_country: Optional[str] = None
    user_city: Optional[str] = None
    
class MatchResult(BaseModel):
    winner_id: uuid.UUID
    winner_new_elo: int
    winner_elo_change: int
    
    loser_id: uuid.UUID
    loser_new_elo: int
    loser_elo_change: int