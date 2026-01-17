import sys
import os

# 1. Add the current directory to Python path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select
from app.db.session import engine
from app.models.brand import Brand

# 2. The Data (The top Bubble Tea brands)
brands_data = [
    {
        "name": "Chatime",
        "website": "https://chatime.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"]
    },
    {
        "name": "Gong Cha",
        "website": "https://gong-cha.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"]
    },
    {
        "name": "The Alley",
        "website": "https://www.the-alley.ca",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "North America", "Europe"]
    },
    {
        "name": "CoCo Fresh Tea & Juice",
        "website": "https://cocobubbletea.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"]
    },
    {
        "name": "Tiger Sugar",
        "website": "https://tigersugar.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "North America"]
    },
    {
        "name": "Kung Fu Tea",
        "website": "https://www.kungfutea.com",
        "country_of_origin": "USA",
        "regions_present": ["North America"]
    },
    {
        "name": "Xing Fu Tang",
        "website": "https://www.xingfutang.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"]
    },
    {
        "name": "Yi Fang Taiwan Fruit Tea",
        "website": "https://yifangtea.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "North America", "Europe"]
    },
    {
        "name": "Sharetea",
        "website": "https://1992sharetea.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"]
    },
    {
        "name": "Machi Machi",
        "website": "https://machimachi.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "Europe", "North America"]
    },
    {
        "name": "Real Fruit Bubble Tea",
        "website": "https://realfruitbubbletea.com",
        "country_of_origin": "Canada",
        "regions_present": ["North America"]
    },
    {
        "name": "Ten Ren's Tea",
        "website": "https://www.tenren.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Global"]
    },
    {
        "name": "One Zo",
        "website": "https://www.onezo.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "North America"]
    },
    {
        "name": "Happy Lemon",
        "website": "https://happy-lemon.com",
        "country_of_origin": "China",
        "regions_present": ["Global"]
    },
    {
        "name": "TP Tea",
        "website": "https://en.tp-tea.com",
        "country_of_origin": "Taiwan",
        "regions_present": ["Asia", "North America"]
    }
]

def seed_brands():
    print("🌱 Seeding database with bubble tea brands...")
    
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