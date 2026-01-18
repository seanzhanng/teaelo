from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.services.discovery_service import DiscoveryService
from app.schemas.discovery import DiscoveryRequest
from app.schemas.brand import BrandRead

router = APIRouter()

def get_service(session: Session = Depends(get_session)) -> DiscoveryService:
    return DiscoveryService(session)

@router.post("/discover", response_model=list[BrandRead])
def discover_brands(
    payload: DiscoveryRequest,
    service: DiscoveryService = Depends(get_service)
):
    """
    Takes a list of Google Places, cleans them, finds/creates brands, 
    and returns the mapped Brands with ELOs.
    """
    return service.discover_stores(payload.places)