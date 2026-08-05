import math
import logging
from typing import List, Dict, Any
from tourism_crawler.models.place import PlaceEnrichedModel

logger = logging.getLogger("tourism_crawler")

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters between two lat/lon points using Haversine formula."""
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class RecommendationGraphService:
    """Generates Recommendation Graph & Distance Matrix between tourism spots."""

    @staticmethod
    def build_recommendation_graph(places: List[PlaceEnrichedModel]) -> List[PlaceEnrichedModel]:
        logger.info(f"Building Proximity Recommendation Graph for {len(places)} places...")

        for target in places:
            nearby_list = []
            for candidate in places:
                if target.place_id == candidate.place_id:
                    continue

                dist = calculate_distance(
                    target.latitude, target.longitude,
                    candidate.latitude, candidate.longitude
                )

                # Include places within 5km radius
                if dist <= 5000.0:
                    nearby_list.append({
                        "place_id": candidate.place_id,
                        "name": candidate.name,
                        "category": candidate.tourism_category,
                        "distance_meters": round(dist, 1),
                        "distance_km": round(dist / 1000.0, 2)
                    })

            # Sort nearby places by distance ascending
            nearby_list.sort(key=lambda x: x["distance_meters"])
            target.nearby_places = nearby_list[:5] # Top 5 nearest spots

        return places
