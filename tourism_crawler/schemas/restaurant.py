from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class RestaurantBase(BaseModel):
    restaurant_name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    opening_hours: Optional[str] = None
    price_range: Optional[str] = None
    special_dishes: List[str] = Field(default_factory=list)
    menu: List[Dict[str, Any]] = Field(default_factory=list)
    rating: Optional[float] = 0.0
    reviews_count: Optional[int] = 0
    facebook: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    videos: List[str] = Field(default_factory=list)


class RestaurantCreate(RestaurantBase):
    id: str


class RestaurantResponse(RestaurantBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
