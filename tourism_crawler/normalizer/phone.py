import re
from typing import Optional


def normalize_phone_number(phone_str: Optional[str]) -> Optional[str]:
    """Standardize Vietnamese phone numbers to international (+84) or standard 10-digit format."""
    if not phone_str:
        return None
    cleaned = re.sub(r'[^\d+]', '', phone_str)
    if cleaned.startswith('84') and len(cleaned) == 11:
        cleaned = '0' + cleaned[2:]
    if cleaned.startswith('+84') and len(cleaned) == 12:
        cleaned = '0' + cleaned[3:]
    if len(cleaned) in (10, 11) and cleaned.startswith('0'):
        return cleaned
    return None
