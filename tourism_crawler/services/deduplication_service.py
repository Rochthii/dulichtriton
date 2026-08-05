import math
from typing import List, Dict, Any
from tourism_crawler.models.place import PlaceEnrichedModel

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Haversine distance in meters between two lat/lon points."""
    R = 6371000  # Radius of earth in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class DeduplicationService:
    """Enterprise Deduplication Service for Google Maps Tourism Records."""

    @staticmethod
    def deduplicate_places(places: List[PlaceEnrichedModel]) -> List[PlaceEnrichedModel]:
        unique_places: List[PlaceEnrichedModel] = []
        seen_place_ids = set()

        for place in places:
            # 1. Primary Check: Google Place ID
            if place.place_id in seen_place_ids:
                continue

            # 2. Secondary Check: Proximity + Name Similarity
            is_duplicate = False
            for existing in unique_places:
                dist = calculate_haversine_distance(
                    place.latitude, place.longitude,
                    existing.latitude, existing.longitude
                )

                # Distance < 50 meters and similar name
                if dist < 50.0 and (place.name.lower() in existing.name.lower() or existing.name.lower() in place.name.lower()):
                    is_duplicate = True
                    # Keep record with higher review count / rating
                    if place.review_count > existing.review_count:
                        unique_places.remove(existing)
                        unique_places.append(place)
                        seen_place_ids.add(place.place_id)
                    break

            if not is_duplicate:
                seen_place_ids.add(place.place_id)
                unique_places.append(place)

        return unique_places
