import sys
import os

# 1. Add the current directory to Python path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select
from app.db.session import engine
from app.models.brand import Brand

# 2. The Data (Updated with countries_active)
brands_data = [
    {
        "name": "Chatime",
        "website": "https://chatime.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"],
        "countries_active": ["TW", "CA", "US", "AU", "UK", "PH", "MY", "ID"]
    },
    {
        "name": "Gong Cha",
        "website": "https://gong-cha.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"],
        "countries_active": ["TW", "CA", "US", "KR", "JP", "AU", "SG"]
    },
    {
        "name": "The Alley",
        "website": "https://www.the-alley.ca",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "North America", "Europe"],
        "countries_active": ["TW", "CA", "US", "JP", "FR"]
    },
    {
        "name": "CoCo Fresh Tea & Juice",
        "website": "https://cocobubbletea.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"],
        "countries_active": ["TW", "CA", "US", "CN", "PH"]
    },
    {
        "name": "Tiger Sugar",
        "website": "https://tigersugar.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "North America"],
        "countries_active": ["TW", "CA", "US", "HK", "SG"]
    },
    {
        "name": "Kung Fu Tea",
        "website": "https://www.kungfutea.com",
        "country_of_origin": "USA",
        "regions_present": ["North America"],
        "countries_active": ["US", "CA"]
    },
    {
        "name": "Xing Fu Tang",
        "website": "https://www.xingfutang.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"],
        "countries_active": ["TW", "CA", "US", "UK", "FR"]
    },
    {
        "name": "Yi Fang Taiwan Fruit Tea",
        "website": "https://yifangtea.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "North America", "Europe"],
        "countries_active": ["TW", "CA", "US", "UK", "PH"]
    },
    {
        "name": "Sharetea",
        "website": "https://1992sharetea.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"],
        "countries_active": ["TW", "CA", "US", "AU"]
    },
    {
        "name": "Machi Machi",
        "website": "https://machimachi.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "Europe", "North America"],
        "countries_active": ["TW", "CA", "US", "UK", "FR", "AU"]
    },
    {
        "name": "Real Fruit Bubble Tea",
        "website": "https://realfruitbubbletea.com",
        "country_of_origin": "Canada",
        "regions_present": ["North America"],
        "countries_active": ["CA", "US"]
    },
    {
        "name": "Ten Ren's Tea",
        "website": "https://www.tenren.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"],
        "countries_active": ["TW", "CA", "US", "JP", "HK"]
    },
    {
        "name": "One Zo",
        "website": "https://www.onezo.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "North America"],
        "countries_active": ["TW", "CA", "US", "AU"]
    },
    {
        "name": "Happy Lemon",
        "website": "https://happy-lemon.com",
        "country_of_origin": "China",
        "regions_present": ["Global"],
        "countries_active": ["CN", "CA", "US", "UK", "PH"]
    },
    {
        "name": "TP Tea",
        "website": "https://en.tp-tea.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "North America"],
        "countries_active": ["TW", "CA", "US", "HK", "JP"]
    }
]

def seed_brands():
    print("🌱 Seeding database with bubble tea brands...")
    
    # Ensure tables exist before seeding
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        count = 0
        for data in brands_data:
            # Check if brand already exists to avoid duplicates
            existing = session.exec(select(Brand).where(Brand.name == data["name"])).first()
            
            if not existing:
                brand = Brand(**data)  # Unpack dictionary into Brand model
                session.add(brand)
                count += 1
                print(f"   + Added: {data['name']}")
            else:
                print(f"   - Skipped: {data['name']} (Already exists)")
        
        session.commit()
        print(f"\n✅ Done! Added {count} new brands.")

if __name__ == "__main__":
    seed_brands()