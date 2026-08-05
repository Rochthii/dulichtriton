from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime


class PlaceBase(BaseModel):
    name: str = Field(..., description="Tên địa điểm")
    english_name: Optional[str] = None
    category: str = Field(..., description="Danh mục chính")
    subcategory: Optional[str] = None
    description: Optional[str] = None
    full_description: Optional[str] = None
    address: str = Field(..., description="Địa chỉ đầy đủ")
    commune: str = Field(..., description="Xã/Thị trấn thuộc Tri Tôn")
    district: str = "Tri Tôn"
    province: str = "An Giang"
    country: str = "Việt Nam"
    latitude: float
    longitude: float
    google_maps_url: Optional[str] = None
    website: Optional[str] = None
    facebook: Optional[str] = None
    tiktok: Optional[str] = None
    youtube: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    opening_hours: Optional[str] = "06:00 - 18:00"
    ticket_price: Optional[str] = "Miễn phí"
    parking_fee: Optional[str] = None
    average_cost: Optional[str] = None
    rating: Optional[float] = Field(default=0.0, ge=0.0, le=5.0)
    review_count: Optional[int] = Field(default=0, ge=0)
    best_time: Optional[str] = None
    best_season: Optional[str] = None
    recommended_duration: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    images: Dict[str, Any] = Field(default_factory=dict)
    videos: List[Dict[str, Any]] = Field(default_factory=list)
    facilities: List[str] = Field(default_factory=list)
    accessibility: Optional[str] = None
    has_parking: bool = True
    has_wifi: bool = False
    has_toilet: bool = True
    has_restaurant: bool = False
    has_hotel: bool = False
    children_friendly: bool = True
    family_friendly: bool = True
    pet_friendly: bool = False
    drone_allowed: bool = True
    status: str = "verified"
    confidence_score: float = Field(default=100.0, ge=0.0, le=100.0)
    sources_count: int = Field(default=3, ge=1)


class PlaceCreate(PlaceBase):
    id: str


class PlaceResponse(PlaceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
