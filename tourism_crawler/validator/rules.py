from typing import Tuple, Dict, Any
from tourism_crawler.schemas.place import PlaceCreate


def validate_place_schema(data: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate record against Pydantic Place schema rules."""
    try:
        PlaceCreate(**data)
        return True, "Valid Schema"
    except Exception as e:
        return False, str(e)
