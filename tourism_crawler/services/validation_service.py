import logging
import re
from typing import Tuple, List
from tourism_crawler.models.place import PlaceRawModel

logger = logging.getLogger("tourism_crawler")

class DataValidationService:
    """Enterprise Data Quality Validator Engine."""

    @staticmethod
    def validate_place(place: PlaceRawModel) -> Tuple[bool, List[str]]:
        errors = []

        # 1. Coordinate Bounding Box Validation
        if not (10.25 <= place.latitude <= 10.55):
            errors.append(f"Latitude out of bounds: {place.latitude}")
        if not (104.85 <= place.longitude <= 105.15):
            errors.append(f"Longitude out of bounds: {place.longitude}")

        # 2. Rating & Review Count Validation
        if not (0.0 <= place.rating <= 5.0):
            errors.append(f"Invalid rating value: {place.rating}")
        if place.review_count < 0:
            errors.append(f"Negative review count: {place.review_count}")

        # 3. Address Sanity Check (No 'Huyện Tri Tôn', must have Commune/Wards)
        if "Huyện Tri Tôn" in place.address:
            errors.append(f"Banned phrase 'Huyện Tri Tôn' found in address: {place.address}")
        if not place.commune:
            errors.append("Missing Commune/Township administrative boundary")

        # 4. Business Status Validation
        if place.business_status not in ["OPERATIONAL", "CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"]:
            errors.append(f"Unknown business status: {place.business_status}")

        is_valid = len(errors) == 0
        return is_valid, errors
