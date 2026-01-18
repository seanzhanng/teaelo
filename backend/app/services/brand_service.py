from sqlmodel import Session, select, col
from fastapi import HTTPException
import uuid
from sqlalchemy.sql.expression import func

from app.models.brand import Brand
from app.schemas.brand import BrandCreate, BrandUpdate

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
    
    def get_random_pair(self, country_code: str | None = None) -> list[Brand]:
        statement = select(Brand).order_by(func.random())
        
        if country_code:
            candidates = self.session.exec(statement.limit(50)).all()
            
            filtered = [
                b for b in candidates 
                if country_code in b.countries_active or "Global" in b.regions_present
            ]
            
            if len(filtered) < 2:
                return candidates[:2] if len(candidates) >= 2 else []
                
            return filtered[:2]

        return self.session.exec(statement.limit(2)).all()
    
    def get_leaderboard(self, limit: int = 50, offset: int = 0) -> list[Brand]:
        statement = select(Brand).order_by(Brand.elo.desc()).offset(offset).limit(limit)
        return self.session.exec(statement).all()

    def get_all(self, search: str | None = None, limit: int = 100, offset: int = 0) -> list[Brand]:
        statement = select(Brand)
        
        if search:
            statement = statement.where(col(Brand.name).ilike(f"%{search}%"))
            
        return self.session.exec(statement.offset(offset).limit(limit)).all()