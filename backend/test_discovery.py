import requests
import json

# The URL of your new endpoint
URL = "http://127.0.0.1:8000/discovery/discover"

# 1. Simulate data coming from Google Places API
# We include one KNOWN brand (Chatime) and one NEW brand (Sweet Dreams)
fake_google_data = {
    "places": [
        {
            "place_id": "ChIJ-TEST-CHATIME-WATERLOO",
            "name": "Chatime Bubble Tea Waterloo",
            "country": "CA",
            "city": "Waterloo",
            "types": ["cafe", "food", "store"] 
        },
        {
            "place_id": "ChIJ-TEST-SWEET-DREAMS",
            "name": "Sweet Dreams Teashop | University Plaza",
            "country": "CA",
            "city": "Waterloo",
            "types": ["restaurant", "food", "point_of_interest"]
        }
    ]
}

def run_test():
    print(f"📡 Sending {len(fake_google_data['places'])} shops to the Backend...")
    
    try:
        response = requests.post(URL, json=fake_google_data)
        
        if response.status_code == 200:
            brands = response.json()
            print("\n✅ SUCCESS! Backend returned these brands:")
            for b in brands:
                print(f"   - Name: {b['name']}")
                print(f"     ID:   {b['id']}")
                print(f"     ELO:  {b['elo']}")
                print(f"     Active In: {b['countries_active']}")
                print("     -------------------")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        print("   (Is your server running?)")

if __name__ == "__main__":
    run_test()