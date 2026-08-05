from sqlalchemy import String, Float, Text, JSON
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
