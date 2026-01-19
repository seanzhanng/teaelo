import argparse
import os
import sys
import time
from datetime import date
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

from pydantic import BaseModel, Field, constr
from google import genai
from sqlmodel import select
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_ROOT / "backend"

# Load environment variables from backend/.env file
env_path = BACKEND_DIR / ".env"
if env_path.exists():
    load_dotenv(env_path)

sys.path.append(str(BACKEND_DIR))

from app.db.database import session_scope  # noqa: E402
from app.models.brand import Brand  # noqa: E402


class BrandSchema(BaseModel):
    name: str
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    country_of_origin: str
    established_date: Optional[date] = None
    total_locations: int
    regions_present: List[str] = Field(
        default_factory=list,
        description="JSON array of region/country codes in short format (e.g., ['CA', 'USA', 'CHN', 'EU', 'AUS', 'TW', 'SG', 'JP', 'KR', 'UK', 'FR', 'DE', 'MY', 'PH', 'ID']). Use standard country codes or common abbreviations.",
    )
    elo: int = 1200
    tier: str = "B"
    wins: int = 0
    losses: int = 0
    ties: int = 0
    elo_trend: float = 0.0
    rank_trend: int = 0
    description: constr(max_length=250) = Field(
        description="A concise brand description (max 250 characters)."
    )


def load_brand_names(args: argparse.Namespace) -> List[str]:
    names = list(args.names or [])
    if args.file:
        file_path = Path(args.file)
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        file_names = [line.strip() for line in file_path.read_text().splitlines() if line.strip()]
        names.extend(file_names)
    # Deduplicate while preserving order
    seen = set()
    unique = []
    for name in names:
        if name not in seen:
            seen.add(name)
            unique.append(name)
    return unique


def generate_brand_data(client: genai.Client, brand_name: str, retries: int = 3) -> BrandSchema:
    prompt = f"""Provide comprehensive database details for the boba chain: {brand_name}

IMPORTANT: For regions_present, use short country/region codes (e.g., CA, USA, CHN, EU, AUS, TW, SG, JP, KR, UK, FR, DE, MY, PH, ID) instead of full names like "Canada" or "United States". Use standard country codes or common abbreviations."""
    last_error: Exception | None = None

    for attempt in range(1, retries + 1):
        try:
            response = client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": BrandSchema,
                },
            )
            return response.parsed
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt < retries:
                time.sleep(1.5 * attempt)
            else:
                raise exc

    if last_error:
        raise last_error
    raise RuntimeError("Failed to generate brand data")


def upsert_brand(brand_data: BrandSchema) -> str:
    with session_scope() as session:
        existing = session.exec(select(Brand).where(Brand.name == brand_data.name)).first()
        if existing:
            for key, value in brand_data.model_dump().items():
                setattr(existing, key, value)
            session.add(existing)
            return "updated"

        brand = Brand(**brand_data.model_dump())
        session.add(brand)
        return "inserted"


def main() -> int:
    parser = argparse.ArgumentParser(description="Populate brands table using Gemini structured output.")
    parser.add_argument("names", nargs="*", help="Brand names to populate")
    parser.add_argument("--file", help="Path to a text file with one brand name per line")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between requests in seconds")
    parser.add_argument("--retries", type=int, default=3, help="Number of retries for Gemini calls")
    args = parser.parse_args()

    brand_names = load_brand_names(args)
    if not brand_names:
        print("No brand names provided. Pass names or --file.")
        return 1

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is required.")

    client = genai.Client(api_key=api_key)

    inserted = 0
    updated = 0
    failed: List[Tuple[str, str]] = []

    for index, name in enumerate(brand_names, start=1):
        print(f"[{index}/{len(brand_names)}] Generating data for: {name}")
        try:
            brand_data = generate_brand_data(client, name, retries=args.retries)
            result = upsert_brand(brand_data)
            if result == "inserted":
                inserted += 1
            else:
                updated += 1
            print(f"  -> {result}")
        except Exception as exc:  # noqa: BLE001
            failed.append((name, str(exc)))
            print(f"  -> failed: {exc}")

        time.sleep(args.delay)

    print("\nSummary")
    print(f"Inserted: {inserted}")
    print(f"Updated: {updated}")
    print(f"Failed: {len(failed)}")
    if failed:
        for name, error in failed:
            print(f" - {name}: {error}")

    return 0 if not failed else 2


if __name__ == "__main__":
    raise SystemExit(main())

