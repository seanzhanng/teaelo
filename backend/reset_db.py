from sqlmodel import Session, text
from app.db.session import engine

def nuke_database():
    print("☢️  NUKING DATABASE...")
    with Session(engine) as session:
        session.exec(text("DELETE FROM matches"))
        session.exec(text("DELETE FROM store_locations"))
        session.exec(text("DELETE FROM brands"))
        
        session.commit()
    print("✅ Database is empty (Matches, Stores, Brands).\n")

if __name__ == "__main__":
    nuke_database()