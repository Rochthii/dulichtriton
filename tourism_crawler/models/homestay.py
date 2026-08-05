from sqlalchemy import String, Float, Text, JSON
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
