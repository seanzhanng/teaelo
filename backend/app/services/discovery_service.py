from sqlmodel import Session, select
from app.models.brand import Brand
from app.models.store import StoreLocation
from app.schemas.brand import BrandRead
from app.utils.text import clean_brand_name
from thefuzz import process
import uuid
from datetime import date

class DiscoveryService:
    def __init__(self, session: Session):
        self.session = session

    # Update return type hint to return the Read Schema
    def discover_stores(self, google_places: list) -> list[BrandRead]:
        brand_ids = set()
        
        for place in google_places:
            place_id = place.place_id
            raw_name = place.name
            country = place.country
            city = place.city if place.city else "Unknown"
            types = place.types if place.types else []

            # 1. CACHE CHECK
            store = self.session.exec(
                select(StoreLocation).where(StoreLocation.google_place_id == place_id)
            ).first()

            if store:
                brand_ids.add(store.brand_id)
                continue 

            # 2. CLEANING
            cleaned_name = clean_brand_name(raw_name, google_types=types)
            
            # 3. MATCHING
            all_brands = self.session.exec(select(Brand)).all()
            existing_brand = self._fuzzy_match_brand(cleaned_name, all_brands)

            if existing_brand:
                brand = existing_brand
                
                # Update Regions
                current_regions = brand.regions_present or []
                if country not in current_regions:
                    brand.regions_present = list(set(current_regions + [country]))
                
                brand.total_locations = (brand.total_locations or 0) + 1
                self.session.add(brand)
            else:
                # Create New Brand
                brand = Brand(
                    name=cleaned_name,
                    tier="Unranked",
                    elo=1200,
                    regions_present=[country],
                    total_locations=1 
                )
                self._mock_enrich_brand(brand)
                self.session.add(brand)
                self.session.commit()
                self.session.refresh(brand)

            # Link Store
            new_store = StoreLocation(
                google_place_id=place_id,
                brand_id=brand.id,
                country_code=country,
                city=city
            )
            self.session.add(new_store)
            self.session.commit()
            
            brand_ids.add(brand.id)

        # --- RANK CALCULATION & SCHEMA CONVERSION ---
        # 1. Get the raw DB models
        db_brands = self.session.exec(
            select(Brand).where(Brand.id.in_(brand_ids))
        ).all()
        
        results = []
        for db_brand in db_brands:
            # 2. Convert DB Model -> Read Schema (This object has the .rank field)
            brand_read = BrandRead.model_validate(db_brand)
            
            # 3. Calculate Rank dynamically
            higher_elo_count = self.session.exec(
                select(Brand).where(Brand.elo > db_brand.elo)
            ).all()
            
            # 4. Assign rank to the Schema object
            brand_read.rank = len(higher_elo_count) + 1
            results.append(brand_read)
            
        return results

    def _fuzzy_match_brand(self, name: str, brands: list[Brand]) -> Brand | None:
        if not brands: return None
        brand_map = {b.name: b for b in brands}
        match_name, score = process.extractOne(name, list(brand_map.keys()))
        if score >= 85: return brand_map[match_name]
        return None

    def _mock_enrich_brand(self, brand: Brand):
        print(f"🤖 [AGENT] Enriching metadata for: {brand.name}...")
        
        if "Chatime" in brand.name:
            brand.description = "Global teahouse chain known for its purple branding."
            brand.website_url = "https://chatime.com"
            brand.logo_url = "https://logo.clearbit.com/chatime.com"
            brand.country_of_origin = "Taiwan"
            brand.established_date = date(2005, 1, 1)
        elif "The Alley" in brand.name:
            brand.description = "Famous for their Brown Sugar Deerioca Series."
            brand.website_url = "https://the-alley.ca"
            brand.logo_url = "https://logo.clearbit.com/the-alley.ca"
            brand.country_of_origin = "Taiwan"
            brand.established_date = date(2013, 1, 1)
        else:
            brand.description = f"A popular local spot in {brand.regions_present}."
            brand.website_url = f"https://www.google.com/search?q={brand.name}"
            brand.logo_url = "https://placehold.co/100"
            brand.country_of_origin = brand.regions_present[0] if brand.regions_present else "Unknown"
            brand.established_date = date(2025, 1, 1)