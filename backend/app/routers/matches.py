from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.services.match_service import MatchService
from app.schemas.match import MatchCreate, MatchResult

router = APIRouter()

def get_match_service(session: Session = Depends(get_session)) -> MatchService:
    return MatchService(session)

@router.post("/", response_model=MatchResult)
def record_match(
    match_data: MatchCreate, 
    service: MatchService = Depends(get_match_service)
):
    return service.record_match(match_data)