import uuid
from sqlmodel import Field, SQLModel
from datetime import datetime

class StoreLocation(SQLModel, table=True):
    __tablename__ = "store_locations"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    google_place_id: str = Field(index=True, unique=True)
    brand_id: uuid.UUID = Field(foreign_key="brands.id")
    country_code: str | None = None
    city: str | None = None
    last_verified: datetime = Field(default_factory=datetime.utcnow)