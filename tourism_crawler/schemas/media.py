from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime


class MediaItemCreate(BaseModel):
    title: Optional[str] = None
    url: str
    platform: str = Field(default="youtube", description="youtube, tiktok, facebook, web")
    thumbnail: Optional[str] = None
    duration: Optional[str] = None
    upload_date: Optional[str] = None
    view_count: Optional[int] = None
    place_id: Optional[str] = None


class MediaItemResponse(MediaItemCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
