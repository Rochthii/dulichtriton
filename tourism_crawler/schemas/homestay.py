from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class HomestayBase(BaseModel):
    name: str
    type: str = Field(default="Homestay")
    address: str
    phone: Optional[str] = None
    price_range: Optional[str] = None
    facilities: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    videos: List[str] = Field(default_factory=list)
    booking_links: List[str] = Field(default_factory=list)
    rating: Optional[float] = 0.0


class HomestayCreate(HomestayBase):
    id: str


class HomestayResponse(HomestayBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
