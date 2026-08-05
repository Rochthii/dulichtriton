from typing import Dict, Any
from tourism_crawler.normalizer.text import clean_vietnamese_text
from tourism_crawler.normalizer.address import normalize_address
from tourism_crawler.normalizer.coordinates import validate_coordinates
from tourism_crawler.normalizer.phone import normalize_phone_number
from tourism_crawler.normalizer.category import normalize_category


class NormalizationPipeline:
    """Executes full normalization workflow on raw records."""

    def normalize(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        data = raw_data.copy()
        
        # Clean text
        data["name"] = clean_vietnamese_text(data.get("name", ""))
        data["description"] = clean_vietnamese_text(data.get("description", ""))
        
        # Address normalization
        addr_info = normalize_address(data.get("address", ""))
        data["address"] = addr_info["full_address"]
        data["commune"] = addr_info["commune"]
        data["district"] = addr_info["district"]
        data["province"] = addr_info["province"]
        data["country"] = addr_info["country"]
        
        # Coordinate validation
        lat = data.get("latitude", 10.4)
        lng = data.get("longitude", 105.0)
        is_valid_coord, _ = validate_coordinates(lat, lng)
        data["latitude"] = lat
        data["longitude"] = lng
        
        # Category normalization
        cat, subcat = normalize_category(data["name"], data.get("category", ""))
        data["category"] = cat
        data["subcategory"] = subcat
        
        # Phone normalization
        data["phone"] = normalize_phone_number(data.get("phone"))
        
        return data
