from fastapi import APIRouter, Depends, status
from sqlmodel import Session
import uuid

from app.db.session import get_session
from app.services.brand_service import BrandService
from app.schemas.brand import BrandCreate, BrandRead, BrandUpdate
from app.schemas.response import StandardResponse

router = APIRouter()

def get_service(session: Session = Depends(get_session)) -> BrandService:
    return BrandService(session)

@router.get("/random", response_model=list[BrandRead])
def get_random_pair(service: BrandService = Depends(get_service)):
    return service.get_random_pair()

@router.get("/leaderboard", response_model=list[BrandRead])
def get_leaderboard(
    limit: int = 50, 
    offset: int = 0, 
    service: BrandService = Depends(get_service)
):
    return service.get_leaderboard(limit, offset)

@router.get("/{brand_id}", response_model=BrandRead)
def get_brand(
    brand_id: uuid.UUID, 
    service: BrandService = Depends(get_service)
):
    
    return service.get_by_id(brand_id)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=StandardResponse)
def create_brand(
    brand: BrandCreate, 
    service: BrandService = Depends(get_service)
):
    service.create(brand)
    return StandardResponse(message="Brand created successfully")

@router.put("/{brand_id}", response_model=StandardResponse)
def update_brand(
    brand_id: uuid.UUID, 
    brand_data: BrandUpdate, 
    service: BrandService = Depends(get_service)
):
    service.update(brand_id, brand_data)
    return StandardResponse(message="Brand updated successfully")

@router.delete("/{brand_id}", response_model=StandardResponse)
def delete_brand(
    brand_id: uuid.UUID, 
    service: BrandService = Depends(get_service)
):
    service.delete(brand_id)
    return StandardResponse(message="Brand deleted successfully")