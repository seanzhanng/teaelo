import requests
import json
import time
from reset_db import nuke_database

# --- CONFIGURATION ---
BASE_URL = "http://127.0.0.1:8000"
DISCOVERY_URL = f"{BASE_URL}/discovery/discover"
MATCH_URL = f"{BASE_URL}/matches/"

# --- RAW GOOGLE DATA ---
RAW_GOOGLE_DATA = [
    {
        "place_id": "ChIJ-REAL-ALLEY-WATERLOO",
        "name": "The Alley Waterloo",
        "types": ["cafe", "food"],
        "address_components": [
            {"long_name": "Waterloo", "short_name": "Waterloo", "types": ["locality"]},
            {"long_name": "Canada", "short_name": "CA", "types": ["country"]}
        ]
    },
    {
        "place_id": "ChIJ-REAL-ALLEY-TORONTO",
        "name": "The Alley - Toronto Downtown",
        "types": ["cafe", "store"],
        "address_components": [
            {"long_name": "Toronto", "short_name": "Toronto", "types": ["locality"]},
            {"long_name": "Canada", "short_name": "CA", "types": ["country"]}
        ]
    },
    {
        "place_id": "ChIJ-REAL-CHATIME",
        "name": "Chatime Innovation District",
        "types": ["point_of_interest", "food"],
        "address_components": [
            {"long_name": "Kitchener", "short_name": "Kitchener", "types": ["locality"]},
            {"long_name": "Canada", "short_name": "CA", "types": ["country"]}
        ]
    }
]

# --- FRONTEND SIMULATION ---
def map_google_to_backend(raw_place):
    country = "Unknown"
    city = "Unknown"
    for component in raw_place.get("address_components", []):
        types = component.get("types", [])
        if "country" in types: country = component["short_name"]
        if "locality" in types: city = component["long_name"]
    return {
        "place_id": raw_place["place_id"],
        "name": raw_place["name"],
        "types": raw_place["types"],
        "country": country,
        "city": city
    }

def run_final_test():
    print("\n🧨 STEP 1: Nuking Database...")
    nuke_database()

    # --- PHASE 1: DISCOVERY ---
    print("\n🚀 STEP 2: Discovery & Enrichment...")
    clean_payload = {"places": [map_google_to_backend(p) for p in RAW_GOOGLE_DATA]}
    
    response = requests.post(DISCOVERY_URL, json=clean_payload)
    brands = response.json()
    
    # Get IDs for the battle
    alley = next(b for b in brands if "The Alley" in b['name'])
    chatime = next(b for b in brands if "Chatime" in b['name'])
    
    print(f"   ✅ Brands Ready: {alley['name']} vs {chatime['name']}")

    # --- PHASE 2: BATTLES (ELO UPDATES) ---
    print("\n⚔️  STEP 3: Simulating 2 Matches in Waterloo...")
    
    # We explicitly define the location here
    city = "Waterloo"
    country = "CA"

    # Battle 1
    match_payload_1 = {
        "winner_id": str(alley['id']), 
        "loser_id": str(chatime['id']),
        "location_city": city,       # <--- THESE KEYS MUST MATCH SCHEMA
        "location_country": country
    }
    requests.post(MATCH_URL, json=match_payload_1)
    
    # Battle 2
    match_payload_2 = {
        "winner_id": str(alley['id']), 
        "loser_id": str(chatime['id']),
        "location_city": city,       
        "location_country": country
    }
    requests.post(MATCH_URL, json=match_payload_2)

    print("   ✅ Matches recorded.")

    # --- PHASE 3: VERIFY ELO ---
    print("\n📊 STEP 4: Verifying Results...")
    # Refresh data
    response_final = requests.post(DISCOVERY_URL, json=clean_payload)
    brands_final = response_final.json()
    
    alley_final = next(b for b in brands_final if b['id'] == alley['id'])
    
    print(f"   🏆 {alley_final['name']} ELO: {alley_final['elo']} (Should be > 1200)")
    
    if alley_final['elo'] > 1200:
        print("   ✅ SUCCESS: System is fully operational.")
    else:
        print("   ❌ FAIL: ELO did not update.")

if __name__ == "__main__":
    run_final_test()