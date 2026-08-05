from sqlalchemy import String, Integer, Text
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
