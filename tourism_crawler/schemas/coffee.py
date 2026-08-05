from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CoffeeShopBase(BaseModel):
    name: str
    theme: Optional[str] = None
    view: Optional[str] = None
    address: str
    opening_hours: Optional[str] = None
    price_range: Optional[str] = None
    signature_drinks: List[str] = Field(default_factory=list)
    photo_spots: List[str] = Field(default_factory=list)
    rating: Optional[float] = 0.0
    phone: Optional[str] = None
    google_maps_url: Optional[str] = None


class CoffeeShopCreate(CoffeeShopBase):
    id: str


class CoffeeShopResponse(CoffeeShopBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
