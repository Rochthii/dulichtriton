import os

files = {}

# --- SCHEMAS ---
files["tourism_crawler/schemas/__init__.py"] = '''from tourism_crawler.schemas.place import PlaceCreate, PlaceResponse
from tourism_crawler.schemas.restaurant import RestaurantCreate, RestaurantResponse
from tourism_crawler.schemas.coffee import CoffeeShopCreate, CoffeeShopResponse
from tourism_crawler.schemas.homestay import HomestayCreate, HomestayResponse
from tourism_crawler.schemas.media import MediaItemCreate, MediaItemResponse

__all__ = [
    "PlaceCreate", "PlaceResponse",
    "RestaurantCreate", "RestaurantResponse",
    "CoffeeShopCreate", "CoffeeShopResponse",
    "HomestayCreate", "HomestayResponse",
    "MediaItemCreate", "MediaItemResponse"
]
'''

files["tourism_crawler/schemas/media.py"] = '''from pydantic import BaseModel, Field, HttpUrl
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
'''

files["tourism_crawler/schemas/place.py"] = '''from pydantic import BaseModel, Field, HttpUrl
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
'''

files["tourism_crawler/schemas/restaurant.py"] = '''from pydantic import BaseModel, Field
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
'''

files["tourism_crawler/schemas/coffee.py"] = '''from pydantic import BaseModel, Field
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
'''

files["tourism_crawler/schemas/homestay.py"] = '''from pydantic import BaseModel, Field
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
'''

# --- MODELS (SQLAlchemy 2.0 ORM) ---
files["tourism_crawler/models/__init__.py"] = '''from tourism_crawler.models.base import Base
from tourism_crawler.models.place import PlaceModel
from tourism_crawler.models.restaurant import RestaurantModel
from tourism_crawler.models.coffee import CoffeeShopModel
from tourism_crawler.models.homestay import HomestayModel
from tourism_crawler.models.media import MediaItemModel
from tourism_crawler.models.verification import VerificationSourceModel

__all__ = [
    "Base", "PlaceModel", "RestaurantModel",
    "CoffeeShopModel", "HomestayModel", "MediaItemModel",
    "VerificationSourceModel"
]
'''

files["tourism_crawler/models/base.py"] = '''from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, func
from datetime import datetime


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
'''

files["tourism_crawler/models/place.py"] = '''from sqlalchemy import String, Float, Boolean, Text, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column
from tourism_crawler.models.base import Base, TimestampMixin


class PlaceModel(Base, TimestampMixin):
    __tablename__ = "places"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    english_name: Mapped[str] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    subcategory: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    full_description: Mapped[str] = mapped_column(Text, nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    commune: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(100), default="Tri Tôn")
    province: Mapped[str] = mapped_column(String(100), default="An Giang")
    country: Mapped[str] = mapped_column(String(100), default="Việt Nam")
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    google_maps_url: Mapped[str] = mapped_column(Text, nullable=True)
    website: Mapped[str] = mapped_column(String(500), nullable=True)
    facebook: Mapped[str] = mapped_column(String(500), nullable=True)
    tiktok: Mapped[str] = mapped_column(String(500), nullable=True)
    youtube: Mapped[str] = mapped_column(String(500), nullable=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    email: Mapped[str] = mapped_column(String(100), nullable=True)
    opening_hours: Mapped[str] = mapped_column(String(100), nullable=True)
    ticket_price: Mapped[str] = mapped_column(String(200), nullable=True)
    parking_fee: Mapped[str] = mapped_column(String(200), nullable=True)
    average_cost: Mapped[str] = mapped_column(String(200), nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    best_time: Mapped[str] = mapped_column(String(200), nullable=True)
    best_season: Mapped[str] = mapped_column(String(200), nullable=True)
    recommended_duration: Mapped[str] = mapped_column(String(100), nullable=True)
    tags: Mapped[dict] = mapped_column(JSON, default=list)
    images: Mapped[dict] = mapped_column(JSON, default=dict)
    videos: Mapped[dict] = mapped_column(JSON, default=list)
    facilities: Mapped[dict] = mapped_column(JSON, default=list)
    accessibility: Mapped[str] = mapped_column(Text, nullable=True)
    has_parking: Mapped[bool] = mapped_column(Boolean, default=True)
    has_wifi: Mapped[bool] = mapped_column(Boolean, default=False)
    has_toilet: Mapped[bool] = mapped_column(Boolean, default=True)
    has_restaurant: Mapped[bool] = mapped_column(Boolean, default=False)
    has_hotel: Mapped[bool] = mapped_column(Boolean, default=False)
    children_friendly: Mapped[bool] = mapped_column(Boolean, default=True)
    family_friendly: Mapped[bool] = mapped_column(Boolean, default=True)
    pet_friendly: Mapped[bool] = mapped_column(Boolean, default=False)
    drone_allowed: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(50), default="verified")
    confidence_score: Mapped[float] = mapped_column(Float, default=100.0)
    sources_count: Mapped[int] = mapped_column(Integer, default=3)
'''

files["tourism_crawler/models/restaurant.py"] = '''from sqlalchemy import String, Float, Text, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column
from tourism_crawler.models.base import Base, TimestampMixin


class RestaurantModel(Base, TimestampMixin):
    __tablename__ = "restaurants"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    restaurant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    opening_hours: Mapped[str] = mapped_column(String(100), nullable=True)
    price_range: Mapped[str] = mapped_column(String(100), nullable=True)
    special_dishes: Mapped[dict] = mapped_column(JSON, default=list)
    menu: Mapped[dict] = mapped_column(JSON, default=list)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)
    facebook: Mapped[str] = mapped_column(String(500), nullable=True)
    website: Mapped[str] = mapped_column(String(500), nullable=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    images: Mapped[dict] = mapped_column(JSON, default=list)
    videos: Mapped[dict] = mapped_column(JSON, default=list)
'''

files["tourism_crawler/models/coffee.py"] = '''from sqlalchemy import String, Float, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from tourism_crawler.models.base import Base, TimestampMixin


class CoffeeShopModel(Base, TimestampMixin):
    __tablename__ = "coffee_shops"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    theme: Mapped[str] = mapped_column(String(100), nullable=True)
    view: Mapped[str] = mapped_column(String(255), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    opening_hours: Mapped[str] = mapped_column(String(100), nullable=True)
    price_range: Mapped[str] = mapped_column(String(100), nullable=True)
    signature_drinks: Mapped[dict] = mapped_column(JSON, default=list)
    photo_spots: Mapped[dict] = mapped_column(JSON, default=list)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    google_maps_url: Mapped[str] = mapped_column(Text, nullable=True)
'''

files["tourism_crawler/models/homestay.py"] = '''from sqlalchemy import String, Float, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from tourism_crawler.models.base import Base, TimestampMixin


class HomestayModel(Base, TimestampMixin):
    __tablename__ = "homestays"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), default="Homestay")
    address: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    price_range: Mapped[str] = mapped_column(String(100), nullable=True)
    facilities: Mapped[dict] = mapped_column(JSON, default=list)
    images: Mapped[dict] = mapped_column(JSON, default=list)
    videos: Mapped[dict] = mapped_column(JSON, default=list)
    booking_links: Mapped[dict] = mapped_column(JSON, default=list)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
'''

files["tourism_crawler/models/media.py"] = '''from sqlalchemy import String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from tourism_crawler.models.base import Base, TimestampMixin


class MediaItemModel(Base, TimestampMixin):
    __tablename__ = "media_items"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(Text, nullable=True)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    platform: Mapped[str] = mapped_column(String(50), default="youtube")
    thumbnail: Mapped[str] = mapped_column(Text, nullable=True)
    duration: Mapped[str] = mapped_column(String(50), nullable=True)
    upload_date: Mapped[str] = mapped_column(String(50), nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, nullable=True)
    place_id: Mapped[str] = mapped_column(String(64), nullable=True)
'''

files["tourism_crawler/models/verification.py"] = '''from sqlalchemy import String, Float, Text
from sqlalchemy.orm import Mapped, mapped_column
from tourism_crawler.models.base import Base, TimestampMixin


class VerificationSourceModel(Base, TimestampMixin):
    __tablename__ = "verification_sources"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    entity_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    source_name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=100.0)
    raw_snippet: Mapped[str] = mapped_column(Text, nullable=True)
'''

for filepath, content in files.items():
    dirname = os.path.dirname(filepath)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Phase 2 complete: Wrote {len(files)} schemas and ORM models.")
