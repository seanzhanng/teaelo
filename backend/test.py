import requests
import json
import time
from reset_db import nuke_database

BASE_URL = "http://127.0.0.1:8000"
DISCOVERY_URL = f"{BASE_URL}/discovery/discover"
MATCH_URL = f"{BASE_URL}/matches/"

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

    print("\n🚀 STEP 2: Discovery & Enrichment...")
    clean_payload = {"places": [map_google_to_backend(p) for p in RAW_GOOGLE_DATA]}
    
    response = requests.post(DISCOVERY_URL, json=clean_payload)
    brands = response.json()
    
    alley = next(b for b in brands if "The Alley" in b['name'])
    chatime = next(b for b in brands if "Chatime" in b['name'])
    
    print(f"   ✅ Brands Found: {len(brands)}")
    
    if alley['total_locations'] == 2:
        print(f"   ✅ LOCATION COUNT: 'The Alley' has 2 locations.")
    else:
        print(f"   ❌ FAIL: 'The Alley' count is {alley['total_locations']}")

    if "CA" in alley['regions_present']:
        print(f"   ✅ REGIONS: 'The Alley' present in {alley['regions_present']}")
    else:
        print(f"   ❌ FAIL: Regions missing CA")

    if alley['rank'] is not None:
         print(f"   ✅ RANK: 'The Alley' is Rank #{alley['rank']}")
    else:
         print(f"   ❌ FAIL: Rank is null")

    print("\n⚔️  STEP 3: Simulating 2 Matches in Waterloo...")
    
    city = "Waterloo"
    country = "CA"

    match_payload_1 = {
        "winner_id": str(alley['id']), 
        "loser_id": str(chatime['id']),
        "location_city": city,       
        "location_country": country
    }
    requests.post(MATCH_URL, json=match_payload_1)
    
    match_payload_2 = {
        "winner_id": str(alley['id']), 
        "loser_id": str(chatime['id']),
        "location_city": city,       
        "location_country": country
    }
    requests.post(MATCH_URL, json=match_payload_2)

    print("   ✅ Matches recorded.")

    print("\n📊 STEP 4: Verifying Results...")
    response_final = requests.post(DISCOVERY_URL, json=clean_payload)
    brands_final = response_final.json()
    
    alley_final = next(b for b in brands_final if b['id'] == alley['id'])
    chatime_final = next(b for b in brands_final if b['id'] == chatime['id'])
    
    print(f"   🏆 {alley_final['name']} ELO: {alley_final['elo']} (Rank #{alley_final['rank']})")
    print(f"   📉 {chatime_final['name']} ELO: {chatime_final['elo']} (Rank #{chatime_final['rank']})")
    
    if alley_final['elo'] > 1200 and alley_final['rank'] < chatime_final['rank']:
        print("   ✅ SUCCESS: ELO updated and Ranking logic works.")
    else:
        print("   ❌ FAIL: ELO or Ranking logic failed.")

if __name__ == "__main__":
    run_final_test()