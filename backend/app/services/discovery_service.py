from sqlmodel import Session, select
from app.models.brand import Brand
from app.models.store import StoreLocation
from app.utils.text import clean_brand_name
from thefuzz import process
import uuid
from datetime import date

class DiscoveryService:
    def __init__(self, session: Session):
        self.session = session

    def discover_stores(self, google_places: list) -> list[Brand]:
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
                
                # --- UPDATE EXISTING BRAND ---
                # A. Update Active Countries
                current_active = brand.countries_active or []
                if country not in current_active:
                    brand.countries_active = list(set(current_active + [country]))
                
                # B. Increment Location Count (We found a new physical shop!)
                brand.total_locations = (brand.total_locations or 0) + 1
                
                self.session.add(brand)
            else:
                # 4. CREATE NEW BRAND
                brand = Brand(
                    name=cleaned_name,
                    tier="Unranked",
                    elo=1200,
                    countries_active=[country],
                    total_locations=1 # Start with 1
                )
                
                # --- MOCK AGENT ---
                self._mock_enrich_brand(brand)

                self.session.add(brand)
                self.session.commit()
                self.session.refresh(brand)

            # 5. LINK STORE
            new_store = StoreLocation(
                google_place_id=place_id,
                brand_id=brand.id,
                country_code=country,
                city=city
            )
            self.session.add(new_store)
            self.session.commit()
            
            brand_ids.add(brand.id)

        # Return results
        if not brand_ids:
            return []
            
        results = self.session.exec(
            select(Brand).where(Brand.id.in_(brand_ids))
        ).all()
        return results

    def _fuzzy_match_brand(self, name: str, brands: list[Brand]) -> Brand | None:
        if not brands: return None
        brand_map = {b.name: b for b in brands}
        match_name, score = process.extractOne(name, list(brand_map.keys()))
        if score >= 85: return brand_map[match_name]
        return None

    def _mock_enrich_brand(self, brand: Brand):
        """Mock Gemini Agent filling in metadata"""
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
            brand.description = f"A popular local bubble tea spot discovered in {brand.countries_active}."
            brand.website_url = f"https://www.google.com/search?q={brand.name}"
            brand.logo_url = "https://placehold.co/100"
            brand.country_of_origin = brand.countries_active[0] if brand.countries_active else "Unknown"
            brand.established_date = date(2025, 1, 1)