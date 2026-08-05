import os

files = {}

# --- NORMALIZER MODULES ---
files["tourism_crawler/normalizer/__init__.py"] = '''from tourism_crawler.normalizer.pipeline import NormalizationPipeline

__all__ = ["NormalizationPipeline"]
'''

files["tourism_crawler/normalizer/text.py"] = '''import re
import unicodedata


def clean_vietnamese_text(text: str) -> str:
    """Normalize Vietnamese unicode string and remove trailing extra whitespaces."""
    if not text:
        return ""
    text = unicodedata.normalize('NFC', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def remove_html_tags(text: str) -> str:
    """Strip HTML tags from HTML strings."""
    if not text:
        return ""
    return re.sub(r'<[^>]+>', '', text).strip()
'''

files["tourism_crawler/normalizer/address.py"] = '''from tourism_crawler.config.settings import settings
from tourism_crawler.normalizer.text import clean_vietnamese_text

TRI_TON_COMMUNES = [
    "Thị trấn Tri Tôn", "Thị trấn Ba Chúc", "Xã Núi Tô", "Xã Ô Lâm",
    "Xã An Tức", "Xã Chau Lăng", "Xã Lương Phi", "Xã Lê Trì",
    "Xã Lạc Quới", "Xã Lương An Trà", "Xã Vĩnh Gia", "Xã Tân Tuyến",
    "Xã Cô Tô", "Xã Định Mỹ", "Xã Định Thành"
]


def normalize_address(address_str: str) -> dict:
    """Standardize address to ensure District: Tri Tôn and Province: An Giang."""
    cleaned = clean_vietnamese_text(address_str)
    
    detected_commune = "Thị trấn Tri Tôn"
    for commune in TRI_TON_COMMUNES:
        if commune.lower() in cleaned.lower():
            detected_commune = commune
            break
            
    return {
        "full_address": cleaned if settings.TARGET_DISTRICT in cleaned else f"{cleaned}, {settings.TARGET_DISTRICT}, {settings.TARGET_PROVINCE}",
        "commune": detected_commune,
        "district": settings.TARGET_DISTRICT,
        "province": settings.TARGET_PROVINCE,
        "country": settings.TARGET_COUNTRY
    }
'''

files["tourism_crawler/normalizer/coordinates.py"] = '''from typing import Tuple
from tourism_crawler.config.settings import settings


def validate_coordinates(lat: float, lng: float) -> Tuple[bool, str]:
    """Validate if Lat/Lng falls strictly within Tri Tôn District bounding box."""
    if not (settings.MIN_LATITUDE <= lat <= settings.MAX_LATITUDE):
        return False, f"Latitude {lat} is outside Tri Tôn bounds [{settings.MIN_LATITUDE}, {settings.MAX_LATITUDE}]"
    if not (settings.MIN_LONGITUDE <= lng <= settings.MAX_LONGITUDE):
        return False, f"Longitude {lng} is outside Tri Tôn bounds [{settings.MIN_LONGITUDE}, {settings.MAX_LONGITUDE}]"
    return True, "Valid coordinates"
'''

files["tourism_crawler/normalizer/phone.py"] = '''import re
from typing import Optional


def normalize_phone_number(phone_str: Optional[str]) -> Optional[str]:
    """Standardize Vietnamese phone numbers to international (+84) or standard 10-digit format."""
    if not phone_str:
        return None
    cleaned = re.sub(r'[^\d+]', '', phone_str)
    if cleaned.startswith('84') and len(cleaned) == 11:
        cleaned = '0' + cleaned[2:]
    if cleaned.startswith('+84') and len(cleaned) == 12:
        cleaned = '0' + cleaned[3:]
    if len(cleaned) in (10, 11) and cleaned.startswith('0'):
        return cleaned
    return None
'''

files["tourism_crawler/normalizer/category.py"] = '''from typing import Tuple

CATEGORY_MAP = {
    "hồ": ("Hồ nước", "Điểm check-in thiên nhiên"),
    "núi": ("Núi", "Trekking & Săn mây"),
    "chùa": ("Chùa Khmer", "Văn hóa - Tâm linh"),
    "đồi": ("Khu sinh thái / Di tích", "Di tích lịch sử"),
    "cây thốt nốt": ("Điểm check-in", "Biểu tượng du lịch"),
    "gà đốt": ("Ẩm thực đặc sản", "Quán ăn Khmer"),
    "cà phê": ("Quán Cà Phê", "Cafe View Đẹp"),
    "homestay": ("Lưu trú", "Homestay & Resort")
}


def normalize_category(name: str, raw_category: str) -> Tuple[str, str]:
    """Classify category and subcategory based on entity name and keywords."""
    combined = f"{name} {raw_category}".lower()
    for kw, (cat, subcat) in CATEGORY_MAP.items():
        if kw in combined:
            return cat, subcat
    return "Địa điểm du lịch", "Điểm tham quan chung"
'''

files["tourism_crawler/normalizer/pipeline.py"] = '''from typing import Dict, Any
from tourism_crawler.normalizer.text import clean_vietnamese_text
from tourism_crawler.normalizer.address import normalize_address
from tourism_crawler.normalizer.coordinates import validate_coordinates
from tourism_crawler.normalizer.phone import normalize_phone_number
from tourism_crawler.normalizer.category import normalize_category


class NormalizationPipeline:
    """Executes full normalization workflow on raw records."""

    def normalize(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        data = raw_data.copy()
        
        # Clean text
        data["name"] = clean_vietnamese_text(data.get("name", ""))
        data["description"] = clean_vietnamese_text(data.get("description", ""))
        
        # Address normalization
        addr_info = normalize_address(data.get("address", ""))
        data["address"] = addr_info["full_address"]
        data["commune"] = addr_info["commune"]
        data["district"] = addr_info["district"]
        data["province"] = addr_info["province"]
        data["country"] = addr_info["country"]
        
        # Coordinate validation
        lat = data.get("latitude", 10.4)
        lng = data.get("longitude", 105.0)
        is_valid_coord, _ = validate_coordinates(lat, lng)
        data["latitude"] = lat
        data["longitude"] = lng
        
        # Category normalization
        cat, subcat = normalize_category(data["name"], data.get("category", ""))
        data["category"] = cat
        data["subcategory"] = subcat
        
        # Phone normalization
        data["phone"] = normalize_phone_number(data.get("phone"))
        
        return data
'''

# --- VALIDATOR MODULES ---
files["tourism_crawler/validator/__init__.py"] = '''from tourism_crawler.validator.rules import validate_place_schema
from tourism_crawler.validator.multi_source import MultiSourceVerifier
from tourism_crawler.validator.confidence import calculate_confidence_score

__all__ = ["validate_place_schema", "MultiSourceVerifier", "calculate_confidence_score"]
'''

files["tourism_crawler/validator/rules.py"] = '''from typing import Tuple, Dict, Any
from tourism_crawler.schemas.place import PlaceCreate


def validate_place_schema(data: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate record against Pydantic Place schema rules."""
    try:
        PlaceCreate(**data)
        return True, "Valid Schema"
    except Exception as e:
        return False, str(e)
'''

files["tourism_crawler/validator/multi_source.py"] = '''from typing import List, Dict, Any


class MultiSourceVerifier:
    """Verifies that an entity is corroborated by at least 3 independent sources."""

    def verify(self, sources: List[Dict[str, Any]]) -> Tuple[bool, int]:
        unique_sources = set()
        for src in sources:
            unique_sources.add(src.get("source_name", "unknown"))
        count = len(unique_sources)
        is_valid = count >= 3
        return is_valid, count
'''

files["tourism_crawler/validator/confidence.py"] = '''from typing import Dict, Any


def calculate_confidence_score(record: Dict[str, Any], source_count: int) -> float:
    """Compute confidence score (0-100) based on completeness and source count."""
    score = 50.0  # Base score
    
    if source_count >= 3:
        score += 30.0
    elif source_count == 2:
        score += 15.0
        
    if record.get("phone"):
        score += 5.0
    if record.get("google_maps_url"):
        score += 10.0
    if record.get("latitude") and record.get("longitude"):
        score += 5.0
        
    return min(score, 100.0)
'''

# --- DEDUPLICATE MODULES ---
files["tourism_crawler/deduplicate/__init__.py"] = '''from tourism_crawler.deduplicate.similarity import is_duplicate
from tourism_crawler.deduplicate.merger import merge_records

__all__ = ["is_duplicate", "merge_records"]
'''

files["tourism_crawler/deduplicate/similarity.py"] = '''import math
from typing import Dict, Any


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters between two lat/lng points."""
    R = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def name_similarity(s1: str, s2: str) -> float:
    """Jaccard character 3-gram similarity ratio."""
    if not s1 or not s2:
        return 0.0
    s1, s2 = s1.lower(), s2.lower()
    set1 = set([s1[i:i+3] for i in range(len(s1)-2)])
    set2 = set([s2[i:i+3] for i in range(len(s2)-2)])
    if not set1 or not set2:
        return 1.0 if s1 == s2 else 0.0
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    return len(intersection) / len(union)


def is_duplicate(rec1: Dict[str, Any], rec2: Dict[str, Any]) -> bool:
    """Detect if rec1 and rec2 refer to the same physical place."""
    # 1. Exact Google Maps URL match
    url1 = rec1.get("google_maps_url")
    url2 = rec2.get("google_maps_url")
    if url1 and url2 and url1 == url2:
        return True

    # 2. Name similarity + Coordinate proximity (< 200 meters)
    sim = name_similarity(rec1.get("name", ""), rec2.get("name", ""))
    if sim > 0.6:
        dist = haversine_distance(
            rec1.get("latitude", 0.0), rec1.get("longitude", 0.0),
            rec2.get("latitude", 0.0), rec2.get("longitude", 0.0)
        )
        if dist < 200.0:
            return True

    return False
'''

files["tourism_crawler/deduplicate/merger.py"] = '''from typing import Dict, Any


def merge_records(rec1: Dict[str, Any], rec2: Dict[str, Any]) -> Dict[str, Any]:
    """Merge duplicate records into a single enriched record."""
    merged = rec1.copy()
    
    # Fill in missing null fields from rec2
    for key, value in rec2.items():
        if merged.get(key) is None and value is not None:
            merged[key] = value

    # Combine tags and images
    tags1 = set(merged.get("tags", []))
    tags2 = set(rec2.get("tags", []))
    merged["tags"] = list(tags1.union(tags2))
    
    # Update sources count
    merged["sources_count"] = merged.get("sources_count", 1) + rec2.get("sources_count", 1)
    
    return merged
'''

for filepath, content in files.items():
    dirname = os.path.dirname(filepath)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Phase 5 complete: Wrote {len(files)} Normalizer, Validator & Deduplication modules.")
