from typing import Dict, Any


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
