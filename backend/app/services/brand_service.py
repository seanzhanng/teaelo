from sqlmodel import Session, select, col, func
from fastapi import HTTPException
import uuid

from app.models.brand import Brand
from app.schemas.brand import BrandCreate, BrandUpdate, BrandRead

class BrandService:
    def __init__(self, session: Session):
        self.session = session

    def _populate_rank(self, brand_read: BrandRead) -> BrandRead:
        """
        Calculates the Global Rank for a single brand by counting 
        how many brands have a higher ELO.
        """
        higher_elo_count = self.session.exec(
            select(func.count()).select_from(Brand).where(Brand.elo > brand_read.elo)
        ).one()
        brand_read.rank = higher_elo_count + 1
        return brand_read

    def create(self, brand_data: BrandCreate) -> Brand:
        brand_db = Brand.model_validate(brand_data)
        self.session.add(brand_db)
        self.session.commit()
        return brand_db

    def get_by_id(self, brand_id: uuid.UUID) -> BrandRead:
        brand = self.session.get(Brand, brand_id)
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
        
        return self._populate_rank(BrandRead.model_validate(brand))

    def update(self, brand_id: uuid.UUID, brand_data: BrandUpdate) -> Brand:
        brand = self.session.get(Brand, brand_id)
        if not brand:
            raise HTTPException(status_code=404, detail="Brand not found")
        
        update_data = brand_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(brand, key, value)
            
        self.session.add(brand)
        self.session.commit()
        return brand

    def delete(self, brand_id: uuid.UUID) -> None:
        brand = self.session.get(Brand, brand_id)
        if brand:
            self.session.delete(brand)
            self.session.commit()
    
    def get_random_pair(self, country_code: str | None = None) -> list[BrandRead]:
        statement = select(Brand).order_by(func.random())
        
        candidates = []
        if country_code:
            raw_candidates = self.session.exec(statement.limit(50)).all()
            
            filtered = [
                b for b in raw_candidates 
                if country_code in (b.regions_present or []) or "Global" in (b.regions_present or [])
            ]
            candidates = filtered[:2] if len(filtered) >= 2 else raw_candidates[:2]
        else:
            candidates = self.session.exec(statement.limit(2)).all()
            
        return [self._populate_rank(BrandRead.model_validate(b)) for b in candidates]
    
    def get_leaderboard(self, limit: int = 50, offset: int = 0) -> list[BrandRead]:
        statement = select(Brand).order_by(Brand.elo.desc()).offset(offset).limit(limit)
        brands = self.session.exec(statement).all()
        
        results = []
        for index, brand in enumerate(brands):
            b_read = BrandRead.model_validate(brand)
            b_read.rank = offset + index + 1
            results.append(b_read)
            
        return results

    def get_all(self, search: str | None = None, limit: int = 100, offset: int = 0) -> list[BrandRead]:
        statement = select(Brand)
        
        if search:
            statement = statement.where(col(Brand.name).ilike(f"%{search}%"))
            
        brands = self.session.exec(statement.offset(offset).limit(limit)).all()
        
        return [self._populate_rank(BrandRead.model_validate(b)) for b in brands]