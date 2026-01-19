from sqlmodel import Session
from fastapi import HTTPException
from app.models.brand import Brand
from app.models.match import Match
from app.core.elo import calculate_new_ratings, get_tier_from_elo 
from app.schemas.match import MatchCreate, MatchResult

class MatchService:
    def __init__(self, session: Session):
        self.session = session

    def record_match(self, match_data: MatchCreate) -> MatchResult:
        brand_a = self.session.get(Brand, match_data.winner_id)
        brand_b = self.session.get(Brand, match_data.loser_id)

        if not brand_a or not brand_b:
            raise HTTPException(status_code=404, detail="Brand not found")

        if brand_a.id == brand_b.id:
            raise HTTPException(status_code=400, detail="Cannot fight itself")

        # 1. Calculate Total Matches for Dynamic K
        matches_a = brand_a.wins + brand_a.losses + brand_a.ties
        matches_b = brand_b.wins + brand_b.losses + brand_b.ties

        # 2. Perform Rigorous Calculation
        new_elo_a, new_elo_b = calculate_new_ratings(
            rating_a=brand_a.elo, matches_a=matches_a,
            rating_b=brand_b.elo, matches_b=matches_b,
            is_tie=match_data.is_tie
        )

        # 3. Deltas
        diff_a = new_elo_a - brand_a.elo
        diff_b = new_elo_b - brand_b.elo

        # 4. Save History
        match_history = Match(
            winner_id=brand_a.id,
            loser_id=brand_b.id,
            winner_elo_before=brand_a.elo,
            winner_elo_after=new_elo_a,
            loser_elo_before=brand_b.elo,
            loser_elo_after=new_elo_b,
            location_country=match_data.location_country,
            location_city=match_data.location_city,
            is_tie=match_data.is_tie
        )
        self.session.add(match_history)

        # 5. Update Stats
        brand_a.elo = new_elo_a
        brand_a.tier = get_tier_from_elo(new_elo_a)
        
        brand_b.elo = new_elo_b
        brand_b.tier = get_tier_from_elo(new_elo_b)

        if match_data.is_tie:
            brand_a.ties += 1
            brand_b.ties += 1
        else:
            brand_a.wins += 1
            brand_b.losses += 1

        self.session.add(brand_a)
        self.session.add(brand_b)
        self.session.commit()
        
        return MatchResult(
            winner_id=brand_a.id,
            winner_new_elo=brand_a.elo,
            winner_elo_change=diff_a,
            loser_id=brand_b.id,
            loser_new_elo=brand_b.elo,
            loser_elo_change=diff_b
        )