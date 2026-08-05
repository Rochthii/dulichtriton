import re
import unicodedata


def clean_vietnamese_text(text: str) -> str:
    """Normalize Vietnamese unicode string and remove trailing extra whitespaces."""
    if not text:
        return ""
    text = unicodedata.normalize('NFC', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def remove_html_tags(text: str) -> str:
    """Strip HTML tags from HTML strings."""
    if not text:
        return ""
    return re.sub(r'<[^>]+>', '', text).strip()
