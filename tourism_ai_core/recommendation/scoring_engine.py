import logging
from typing import List, Dict, Any

logger = logging.getLogger("tourism_ai_core.recommendation")

class ScoringRecommendationEngine:
    """Multi-attribute Weighted Scoring Engine for AI Recommendations."""

    @staticmethod
    def calculate_weighted_score(place: Dict[str, Any], user_context: Dict[str, Any]) -> float:
        """
        Score Formula:
        Score = (Rating * 0.3) + (ReviewCountScore * 0.2) + (DistanceScore * 0.25) + (SuitabilityMatch * 0.25)
        """
        rating_score = float(place.get("rating", 4.5)) / 5.0 * 100.0
        review_count = int(place.get("review_count", 100))
        review_score = min(review_count / 10.0, 100.0)

        # Distance Score (closer = higher score)
        dist_meters = float(place.get("distance_meters", 1000.0))
        dist_score = max(100.0 - (dist_meters / 100.0), 10.0)

        # Suitability Score
        user_companions = user_context.get("entities", {}).get("companions", "general")
        place_suitable = place.get("suitable_for", ["family", "couple"])
        suitability_score = 100.0 if user_companions in place_suitable else 70.0

        weighted_score = (rating_score * 0.3) + (review_score * 0.2) + (dist_score * 0.25) + (suitability_score * 0.25)
        return round(weighted_score, 2)

    @classmethod
    def rank_places(cls, places: List[Dict[str, Any]], user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        for p in places:
            p["weighted_score"] = cls.calculate_weighted_score(p, user_context)

        places.sort(key=lambda x: x["weighted_score"], reverse=True)
        return places
