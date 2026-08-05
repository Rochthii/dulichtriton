from sqlalchemy import String, Float, Text, JSON, Integer
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
