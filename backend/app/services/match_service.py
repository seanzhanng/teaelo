from sqlmodel import Session
from fastapi import HTTPException
import uuid

from app.models.brand import Brand
from app.models.match import Match
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

        match_history = Match(
            winner_id=winner.id,
            loser_id=loser.id,
            winner_elo_before=winner.elo,
            winner_elo_after=new_winner_elo,
            loser_elo_before=loser.elo,
            loser_elo_after=new_loser_elo,
            location_country=match_data.user_country,
            location_city=match_data.user_city
        )
        self.session.add(match_history)

        winner.elo = new_winner_elo
        winner.wins += 1
        winner.tier = get_tier_from_elo(new_winner_elo)
        
        loser.elo = new_loser_elo
        loser.losses += 1
        loser.tier = get_tier_from_elo(new_loser_elo)

        self.session.add(winner)
        self.session.add(loser)
        self.session.commit()
        
        return MatchResult(
            winner_id=winner.id,
            winner_new_elo=winner.elo,
            winner_elo_change=winner_diff,
            loser_id=loser.id,
            loser_new_elo=loser.elo,
            loser_elo_change=loser_diff
        )