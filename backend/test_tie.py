import requests
from sqlmodel import Session, select
from app.db.session import engine
from app.models.brand import Brand

# 1. Get two real Brand IDs from your database
def get_test_brands():
    with Session(engine) as session:
        brands = session.exec(select(Brand).limit(2)).all()
        if len(brands) < 2:
            print("❌ Error: Need at least 2 brands in the database to test.")
            exit()
        return brands[0], brands[1]

def test_tie():
    # Setup
    brand_a, brand_b = get_test_brands()
    
    print(f"\n🥊 MATCH: {brand_a.name} ({brand_a.elo}) vs {brand_b.name} ({brand_b.elo})")
    print("   Action: TIE GAME (is_tie=True)")

    # 2. Send Request to API
    payload = {
        "winner_id": str(brand_a.id),
        "loser_id": str(brand_b.id),
        "is_tie": True,
        "location_city": "Test City"
    }

    try:
        response = requests.post("http://127.0.0.1:8000/matches/", json=payload)
        response.raise_for_status()
        result = response.json()

        # 3. Print Results
        print("\n✅ RESULT:")
        print(f"   {brand_a.name}: {result['winner_new_elo']} (Change: {result['winner_elo_change']})")
        print(f"   {brand_b.name}: {result['loser_new_elo']} (Change: {result['loser_elo_change']})")
        
        # Validation
        if result['winner_elo_change'] == result['loser_elo_change'] == 0:
             print("   ⚠️  Note: ELOs didn't change (Expected if ratings were equal).")
        else:
             print("   ✨ Success: ELOs adjusted for a draw.")

    except Exception as e:
        print(f"❌ API Error: {e}")
        print(response.text)

if __name__ == "__main__":
    test_tie()