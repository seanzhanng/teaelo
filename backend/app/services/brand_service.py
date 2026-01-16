from sqlmodel import Session, select
from fastapi import HTTPException
import uuid

from app.models.brand import Brand
from app.schemas.brand import BrandCreate, BrandUpdate

from sqlalchemy.sql.expression import func

class BrandService:
    def __init__(self, session: Session):
        self.session = session

    def create(self, brand_data: BrandCreate) -> Brand:
        brand_db = Brand.model_validate(brand_data)
        self.session.add(brand_db)
        self.session.commit()
        return brand_db

    def get_by_id(self, brand_id: uuid.UUID) -> Brand:
        brand = self.session.get(Brand, brand_id)
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
        return brand

    def update(self, brand_id: uuid.UUID, brand_data: BrandUpdate) -> Brand:
        brand = self.get_by_id(brand_id)
        
        update_data = brand_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(brand, key, value)
            
        self.session.add(brand)
        self.session.commit()
        return brand

    def delete(self, brand_id: uuid.UUID) -> None:
        brand = self.get_by_id(brand_id)
        self.session.delete(brand)
        self.session.commit()
    
    def get_random_pair(self) -> list[Brand]:
        """
        Returns 2 random brands for a face-off.
        """
        brands = self.session.exec(select(Brand).order_by(func.random()).limit(2)).all()
        
        if len(brands) < 2:
            raise HTTPException(status_code=400, detail="Not enough brands to form a pair")
            
        return brands
    
    def get_leaderboard(self, limit: int = 50, offset: int = 0) -> list[Brand]:
        """
        Returns brands sorted by ELO (descending).
        """
        statement = select(Brand).order_by(Brand.elo.desc()).offset(offset).limit(limit)
        return self.session.exec(statement).all()