import math
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
