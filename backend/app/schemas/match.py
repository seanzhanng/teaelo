from pydantic import BaseModel
import uuid

class MatchCreate(BaseModel):
    winner_id: uuid.UUID
    loser_id: uuid.UUID
    
class MatchResult(BaseModel):
    winner_id: uuid.UUID
    winner_new_elo: int
    winner_elo_change: int
    
    loser_id: uuid.UUID
    loser_new_elo: int
    loser_elo_change: int