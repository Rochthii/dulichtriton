from typing import List, Dict, Any, Tuple


class MultiSourceVerifier:
    """Verifies that an entity is corroborated by at least 3 independent sources."""

    def verify(self, sources: List[Dict[str, Any]]) -> Tuple[bool, int]:
        unique_sources = set()
        for src in sources:
            unique_sources.add(src.get("source_name", "unknown"))
        count = len(unique_sources)
        is_valid = count >= 3
        return is_valid, count
