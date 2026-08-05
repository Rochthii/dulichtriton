from typing import Tuple
from tourism_crawler.config.settings import settings


def validate_coordinates(lat: float, lng: float) -> Tuple[bool, str]:
    """Validate if Lat/Lng falls strictly within Tri Tôn District bounding box."""
    if not (settings.MIN_LATITUDE <= lat <= settings.MAX_LATITUDE):
        return False, f"Latitude {lat} is outside Tri Tôn bounds [{settings.MIN_LATITUDE}, {settings.MAX_LATITUDE}]"
    if not (settings.MIN_LONGITUDE <= lng <= settings.MAX_LONGITUDE):
        return False, f"Longitude {lng} is outside Tri Tôn bounds [{settings.MIN_LONGITUDE}, {settings.MAX_LONGITUDE}]"
    return True, "Valid coordinates"
