import requests
import json
from reset_db import nuke_database

# API Endpoint
URL = "http://127.0.0.1:8000/discovery/discover"

# --- 1. THE RAW MESSY DATA (What Google Actually Gives You) ---
# Notice: No top-level "city" or "country". It's buried in address_components.
RAW_GOOGLE_PLACES_RESPONSE = [
    {
        "place_id": "ChIJ-REAL-ALLEY-WATERLOO",
        "name": "The Alley Waterloo",
        "types": ["cafe", "food", "establishment"],
        "address_components": [
            {"long_name": "170", "types": ["street_number"]},
            {"long_name": "University Avenue West", "types": ["route"]},
            {"long_name": "Waterloo", "short_name": "Waterloo", "types": ["locality", "political"]},
            {"long_name": "Ontario", "short_name": "ON", "types": ["administrative_area_level_1", "political"]},
            {"long_name": "Canada", "short_name": "CA", "types": ["country", "political"]}
        ]
    },
    {
        "place_id": "ChIJ-REAL-CHATIME-KITCHENER",
        "name": "Chatime Innovation District",
        "types": ["point_of_interest", "food", "store"],
        "address_components": [
            {"long_name": "Kitchener", "short_name": "Kitchener", "types": ["locality", "political"]},
            {"long_name": "Canada", "short_name": "CA", "types": ["country", "political"]}
        ]
    },
    {
        "place_id": "ChIJ-REAL-NEW-BRAND-TOKYO",
        "name": "Machi Machi Harajuku",
        "types": ["store", "food"],
        "address_components": [
            {"long_name": "Shibuya City", "short_name": "Shibuya City", "types": ["locality", "political"]},
            {"long_name": "Japan", "short_name": "JP", "types": ["country", "political"]}
        ]
    }
]

# --- 2. THE MAPPER FUNCTION (Frontend Logic) ---
# This is the Typescript logic you will eventually write in Next.js, converted to Python
def map_google_to_backend(raw_place):
    country = "Unknown"
    city = "Unknown"
    
    # Iterate through the components to find the tags we need
    for component in raw_place.get("address_components", []):
        types = component.get("types", [])
        
        if "country" in types:
            country = component["short_name"] # We want "CA", "US", "JP"
        
        if "locality" in types:
            city = component["long_name"]     # We want "Waterloo", "Toronto"
            
    return {
        "place_id": raw_place["place_id"],
        "name": raw_place["name"],
        "types": raw_place["types"],
        "country": country,
        "city": city
    }

# --- 3. THE PIPELINE EXECUTION ---
def run_simulation():
    # A. Nuke DB to verify "Day 1" behavior
    nuke_database()
    
    # B. Run the Frontend Mapper
    print("🔄 Frontend: Mapping Raw Google Data...")
    cleaned_payload = {
        "places": [map_google_to_backend(p) for p in RAW_GOOGLE_PLACES_RESPONSE]
    }
    
    # Debug: Show what we are sending
    print(f"   Mapped {len(cleaned_payload['places'])} items.")
    print(f"   Example: {cleaned_payload['places'][0]['name']} -> Country: {cleaned_payload['places'][0]['country']}")

    # C. Send to Backend
    print("\n📡 Sending to Backend...")
    try:
        response = requests.post(URL, json=cleaned_payload)
        
        if response.status_code == 200:
            brands = response.json()
            print("\n✅ SUCCESS! Backend Processed the Request:")
            print("=========================================")
            for b in brands:
                print(f"🧋 Brand: {b['name']}")
                print(f"   - ID: {b['id']}")
                print(f"   - Desc: {b['description']}")
                print(f"   - Active In: {b['countries_active']}")
                print("-----------------------------------------")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")

    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    run_simulation()