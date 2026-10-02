import math
import re
from typing import Dict, Any, List

# Canonical Alias Registry for Tri Ton tourism landmarks
KNOWN_ALIASES: Dict[str, List[str]] = {
    "ho_ta_pa": [
        "hồ tà pạ",
        "hồ đá tà pạ",
        "tuyệt tình cốc",
        "tuyệt tình cốc an giang",
        "tuyệt tình cốc tà pạ",
        "tuyệt tình cốc bảy núi",
        "hồ tà pạ tuyệt tình cốc",
        "hồ tuyệt tình cốc",
    ],
    "chua_xa_ton": [
        "chùa xà tón",
        "chùa xvayton",
        "chùa cũ",
        "chùa cũ tri tôn",
        "wat xvayton",
    ],
    "chua_ta_pa": [
        "chùa tà pạ",
        "chùa núi tà pạ",
        "chùa chưn num",
        "chùa phật ngọc tà pạ",
    ],
    "nui_co_to": [
        "núi cô tô",
        "núi tô",
        "phụng hoàng sơn",
        "đỉnh cô tô",
    ],
    "nui_dai": [
        "núi dài",
        "ngọa long sơn",
        "núi dài năm giếng",
    ],
    "ho_soai_so": [
        "hồ soài so",
        "suối vàng soài so",
        "khu du lịch soài so",
    ],
    "ho_o_thum": [
        "hồ ô thum",
        "hồ ô thum an giang",
        "hồ chứa nước ô thum",
    ],
}


def normalize_place_name(name: str) -> str:
    """Normalize place name for comparison (lowercase, strip, single spacing)."""
    if not name:
        return ""
    cleaned = re.sub(r"\s+", " ", name.strip().lower())
    return cleaned


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
    s1, s2 = normalize_place_name(s1), normalize_place_name(s2)
    set1 = set([s1[i:i+3] for i in range(len(s1)-2)])
    set2 = set([s2[i:i+3] for i in range(len(s2)-2)])
    if not set1 or not set2:
        return 1.0 if s1 == s2 else 0.0
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    return len(intersection) / len(union)


def matches_known_alias(name1: str, name2: str) -> bool:
    """Check if name1 and name2 belong to the same canonical alias group."""
    n1 = normalize_place_name(name1)
    n2 = normalize_place_name(name2)
    if not n1 or not n2:
        return False
    
    for group_key, aliases in KNOWN_ALIASES.items():
        m1 = any(alias in n1 or n1 in alias for alias in aliases)
        m2 = any(alias in n2 or n2 in alias for alias in aliases)
        if m1 and m2:
            return True
    return False


def is_duplicate(rec1: Dict[str, Any], rec2: Dict[str, Any]) -> bool:
    """Detect if rec1 and rec2 refer to the same physical place."""
    # 1. Exact Google Maps URL match
    url1 = rec1.get("google_maps_url")
    url2 = rec2.get("google_maps_url")
    if url1 and url2 and url1 == url2:
        return True

    name1 = rec1.get("name", "")
    name2 = rec2.get("name", "")
    lat1, lon1 = float(rec1.get("latitude", 0.0)), float(rec1.get("longitude", 0.0))
    lat2, lon2 = float(rec2.get("latitude", 0.0)), float(rec2.get("longitude", 0.0))
    dist = haversine_distance(lat1, lon1, lat2, lon2)

    # Co-location boundary: Physical distance must be close (< 200 meters)
    if dist < 200.0:
        # Check standard 3-gram character similarity
        sim = name_similarity(name1, name2)
        if sim > 0.6:
            return True

        # Check Substring / Containment (e.g. 'Hồ Tà Pạ' in 'Hồ Tà Pạ Tuyệt Tình Cốc')
        n1 = normalize_place_name(name1)
        n2 = normalize_place_name(name2)
        if (n1 in n2 or n2 in n1) and min(len(n1), len(n2)) >= 5:
            return True

        # Check Known Tri Ton Landmarks Aliases (e.g. 'Hồ Tà Pạ' vs 'Tuyệt Tình Cốc An Giang')
        if matches_known_alias(name1, name2):
            return True

    return False
