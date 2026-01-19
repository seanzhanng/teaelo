import os
from typing import List, Optional
from datetime import date
from pydantic import BaseModel, Field
from google import genai

# 1. Define the Schema based on your DB columns
class BobaBrandSchema(BaseModel):
    name: str
    website_url: Optional[str]
    logo_url: Optional[str]
    country_of_origin: str
    established_date: Optional[date]
    total_locations: int
    regions_present: List[str] = Field(description="JSON array of regions like ['Asia', 'North America']")
    description: str = Field(description="A 1-2 sentence description of the brand's style.")
    elo: int = 1200  # Default starting Elo
    tier: str = "Unranked"
    wins: int = 0
    losses: int = 0
    ties: int = 0
    elo_trend: float = 0.0
    rank_trend: int = 0

# 2. Initialize Gemini Client
client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

def generate_brand_data(brand_name: str):
    prompt = f"Generate factual database information for the boba brand: {brand_name}"
    
    # 3. Request Structured Output
    response = client.models.generate_content(
        model="gemini-3.0-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": BobaBrandSchema,
        },
    )
    
    # Validation & Parsing
    brand_data = response.parsed
    return brand_data

# Example Usage
brand = generate_brand_data("Chagee")
print(brand.model_dump_json(indent=2))