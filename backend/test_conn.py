from sqlalchemy import text
from app.db.session import engine

def test_connection():
    try:
        # Try to connect and run a simple query
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("\n✅ APP_DATABASE_URL (Pooler) is working!")
            print(f"   Response: {result.scalar()}")
    except Exception as e:
        print("\n❌ APP_DATABASE_URL failed.")
        print(f"   Error: {e}")

if __name__ == "__main__":
    test_connection()