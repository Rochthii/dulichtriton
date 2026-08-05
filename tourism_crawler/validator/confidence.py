from typing import Dict, Any


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
