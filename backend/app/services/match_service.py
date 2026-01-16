from sqlmodel import Session
from fastapi import HTTPException
import uuid

from app.models.brand import Brand
from app.core.elo import calculate_new_ratings, get_tier_from_elo 
from app.schemas.match import MatchCreate, MatchResult

class MatchService:
    def __init__(self, session: Session):
        self.session = session

    def record_match(self, match_data: MatchCreate) -> MatchResult:
        winner = self.session.get(Brand, match_data.winner_id)
        loser = self.session.get(Brand, match_data.loser_id)

        if not winner or not loser:
            raise HTTPException(status_code=404, detail="One or both brands not found")

        if winner.id == loser.id:
            raise HTTPException(status_code=400, detail="A brand cannot fight itself")

        new_winner_elo, new_loser_elo = calculate_new_ratings(winner.elo, loser.elo)

        winner_diff = new_winner_elo - winner.elo
        loser_diff = new_loser_elo - loser.elo

        winner.elo = new_winner_elo
        winner.wins += 1
        winner.tier = get_tier_from_elo(new_winner_elo)
        
        loser.elo = new_loser_elo
        loser.losses += 1
        loser.tier = get_tier_from_elo(new_loser_elo)

        # 5. Save everything (Transactional)
        self.session.add(winner)
        self.session.add(loser)
        self.session.commit()
        
        self.session.refresh(winner)
        self.session.refresh(loser)

        # 6. Return the detailed result
        return MatchResult(
            winner_id=winner.id,
            winner_new_elo=winner.elo,
            winner_elo_change=winner_diff,
            loser_id=loser.id,
            loser_new_elo=loser.elo,
            loser_elo_change=loser_diff
        )