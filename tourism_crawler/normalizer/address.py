from tourism_crawler.config.settings import settings
from tourism_crawler.normalizer.text import clean_vietnamese_text

TRI_TON_COMMUNES = [
    "Thị trấn Tri Tôn", "Thị trấn Ba Chúc", "Xã Núi Tô", "Xã Ô Lâm",
    "Xã An Tức", "Xã Chau Lăng", "Xã Lương Phi", "Xã Lê Trì",
    "Xã Lạc Quới", "Xã Lương An Trà", "Xã Vĩnh Gia", "Xã Tân Tuyến",
    "Xã Cô Tô", "Xã Định Mỹ", "Xã Định Thành"
]


def normalize_address(address_str: str) -> dict:
    """Standardize address to ensure District: Tri Tôn and Province: An Giang."""
    cleaned = clean_vietnamese_text(address_str)
    
    detected_commune = "Thị trấn Tri Tôn"
    for commune in TRI_TON_COMMUNES:
        if commune.lower() in cleaned.lower():
            detected_commune = commune
            break
            
    return {
        "full_address": cleaned if settings.TARGET_DISTRICT in cleaned else f"{cleaned}, {settings.TARGET_DISTRICT}, {settings.TARGET_PROVINCE}",
        "commune": detected_commune,
        "district": settings.TARGET_DISTRICT,
        "province": settings.TARGET_PROVINCE,
        "country": settings.TARGET_COUNTRY
    }
