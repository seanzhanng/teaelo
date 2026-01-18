from pydantic import BaseModel
from typing import List, Optional

class GooglePlaceInput(BaseModel):
    place_id: str
    name: str
    country: str
    city: Optional[str] = None
    types: List[str] = []

class DiscoveryRequest(BaseModel):
    places: List[GooglePlaceInput]