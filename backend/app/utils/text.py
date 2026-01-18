import spacy
from cleanco import basename
import re

# Load NLP model once (Global variable to avoid reloading)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("⚠️ Spacy model not found. Run: python -m spacy download en_core_web_sm")
    nlp = None

def clean_brand_name(raw_name: str, google_types: list[str] = None) -> str:
    """
    Cleans a raw store name using Legal Entity detection + Google Metadata + NLP.
    Example: "Chatime Canada Ltd. | Waterloo" -> "Chatime"
    """
    if google_types is None:
        google_types = []

    # 1. Clean Legal Entities (e.g., "Chatime Canada Ltd." -> "Chatime Canada")
    # cleanco handles "Ltd", "Inc", "GmbH", "S.A." etc.
    clean = basename(raw_name)

    # 2. Dynamic Type Removal (Using Google's own data)
    # If Google says it's a "cafe" and the name is "Chatime Cafe", remove "Cafe"
    lower_name = clean.lower()
    for place_type in google_types:
        # Google types use underscores like "tea_store"
        readable_type = place_type.replace('_', ' ')
        
        # Remove if it appears at the end (e.g., "Kung Fu Tea Cafe")
        if lower_name.endswith(f" {readable_type}"):
            clean = clean[:-(len(readable_type) + 1)].strip()
            lower_name = clean.lower()

    # 3. NLP Entity Recognition (The "AI" way)
    # Use Spacy to distinguish ORG (Organization) from GPE (Location)
    # e.g., "The Alley at Waterloo" -> "The Alley"
    if nlp:
        doc = nlp(clean)
        org_parts = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
        
        # If the NLP is confident it found an Organization name, prefer that.
        # But if the name is short (e.g. "Coco"), NLP might miss it, so fallback to 'clean'.
        if org_parts and len(" ".join(org_parts)) > 3:
            return " ".join(org_parts)

    # 4. Final Cleanup: Remove common separators that NLP might miss
    # "Chatime - University Ave" -> "Chatime"
    clean = re.split(r'[|\-–@]', clean)[0]
    
    return clean.strip().title()