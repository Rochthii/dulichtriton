from sqlalchemy import String, Float, Text
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
