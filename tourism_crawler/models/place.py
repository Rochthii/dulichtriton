import unicodedata
import re
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

def normalize_nfc(text: Optional[str]) -> str:
    """Normalize text to Unicode NFC and strip banned phrase 'Huyện Tri Tôn'."""
    if not text:
        return ""
    text = unicodedata.normalize("NFC", str(text))
    text = text.replace("Huyện Tri Tôn, ", "").replace(", Huyện Tri Tôn", "").replace("Huyện Tri Tôn", "")
    return text.strip()

def generate_slug(text: str) -> str:
    """Generate SEO-friendly URL slug from Vietnamese text."""
    text = normalize_nfc(text).lower()
    text = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', text)
    text = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', text)
    text = re.sub(r'[ìíịỉĩ]', 'i', text)
    text = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', text)
    text = re.sub(r'[ùúụủũưừứựửữ]', 'u', text)
    text = re.sub(r'[ỳýỵỷỹ]', 'y', text)
    text = re.sub(r'[đ]', 'd', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text).strip('-')
    return text

class PlaceRawModel(BaseModel):
    place_id: str = Field(..., description="Google Place ID")
    name: str = Field(..., description="Place Name")
    category: str = Field(default="Địa điểm du lịch")
    subcategory: Optional[str] = Field(default=None)
    address: str = Field(..., description="Full Address")
    commune: str = Field(default="Thị trấn Tri Tôn")
    district: str = Field(default="Tri Tôn")
    province: str = Field(default="An Giang")
    latitude: float = Field(..., ge=10.25, le=10.55)
    longitude: float = Field(..., ge=104.85, le=105.15)
    google_maps_url: Optional[str] = Field(default=None)
    phone: Optional[str] = Field(default=None)
    website: Optional[str] = Field(default=None)
    business_status: str = Field(default="OPERATIONAL")
    opening_hours: str = Field(default="07:00 - 18:00")
    price_level: Optional[str] = Field(default="Miễn phí")
    rating: float = Field(default=4.5, ge=0.0, le=5.0)
    review_count: int = Field(default=0, ge=0)
    photos: List[str] = Field(default_factory=list)
    photo_urls: List[str] = Field(default_factory=list)
    review_samples: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    description: str = Field(default="")
    short_description: str = Field(default="")
    tags: List[str] = Field(default_factory=list)

    @field_validator("name", "address", "commune", "description", mode="before")
    def nfc_clean(cls, v):
        return normalize_nfc(v)

class PlaceEnrichedModel(PlaceRawModel):
    slug: str
    search_keywords: List[str]
    aliases: List[str] = Field(default_factory=list)
    tourism_category: str
    travel_tags: List[str]
    suitable_for: List[str] = Field(default_factory=list) # family, couple, photography, culture...
    recommended_duration: str
    best_visit_time: str
    family_friendly: bool = True
    couple_friendly: bool = True
    kids_friendly: bool = True
    parking: bool = True
    wifi: bool = True
    ticket_required: bool = False
    sentiment_analysis: Dict[str, Any] = Field(default_factory=dict)
    nearby_places: List[Dict[str, Any]] = Field(default_factory=list) # Recommendation Graph
    knowledge_graph: List[Dict[str, str]] = Field(default_factory=list) # Triples (Subject, Relation, Object)
    confidence_score: float = 95.0
    is_active: bool = True
