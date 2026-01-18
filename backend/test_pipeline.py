import requests
import json
from reset_db import nuke_database

# API Endpoint
URL = "http://127.0.0.1:8000/discovery/discover"

# --- THE SIMULATION DATA ---
# 5 Shops total.
# 1 & 2 are BOTH "The Alley" (Same brand, different locations).
# 3 is "Chatime" (To test specific enrichment).
# 4 & 5 are new random shops.
SIMULATED_GOOGLE_RESULTS = {
    "places": [
        {
            "place_id": "PLACE_ID_1_ALLEY_WATERLOO",
            "name": "The Alley Waterloo",
            "country": "CA",
            "city": "Waterloo",
            "types": ["cafe", "food"]
        },
        {
            "place_id": "PLACE_ID_2_ALLEY_TORONTO",
            "name": "The Alley - Toronto Downtown",
            "country": "CA",
            "city": "Toronto",
            "types": ["cafe", "store"]
        },
        {
            "place_id": "PLACE_ID_3_CHATIME",
            "name": "Chatime Innovation District",
            "country": "CA",
            "city": "Kitchener",
            "types": ["point_of_interest", "food"]
        },
        {
            "place_id": "PLACE_ID_4_MOM_POP",
            "name": "Sweet Boba Lab",
            "country": "CA",
            "city": "Waterloo",
            "types": ["restaurant"]
        },
        {
            "place_id": "PLACE_ID_5_UNKNOWN",
            "name": "Kung Fu Tea Express", # Should clean to "Kung Fu Tea"
            "country": "US",
            "city": "New York",
            "types": ["store"]
        }
    ]
}

def run_pipeline():
    # 1. Nuke the DB
    nuke_database()

    # 2. Simulate the API Call
    print("📡 Frontend: Sending 5 Google Places to Backend...")
    try:
        response = requests.post(URL, json=SIMULATED_GOOGLE_RESULTS)
        
        if response.status_code == 200:
            brands = response.json()
            print("\n✨ PIPELINE SUCCESS! Here is the result:")
            print("=========================================")
            
            for b in brands:
                print(f"🧋 Brand: {b['name']}")
                print(f"   - ID: {b['id']}")
                print(f"   - Desc: {b['description']}") # Proves Mock Agent worked
                print(f"   - Active In: {b['countries_active']}")
                print("-----------------------------------------")
            
            print(f"\n📊 Summary:")
            print(f"   Input Shops: 5")
            print(f"   Unique Brands Created: {len(brands)}") 
            if len(brands) == 4:
                print("   ✅ SUCCESS: 'The Alley' locations merged into 1 Brand!")
            else:
                print(f"   ❌ FAIL: Expected 4 brands, got {len(brands)}")
                
        else:
            print(f"❌ API Error: {response.text}")

    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    run_pipeline()