import logging
from typing import List, Dict, Any
from tourism_crawler.models.place import PlaceEnrichedModel

logger = logging.getLogger("tourism_crawler")

class EmbeddingChunkerService:
    """Chunks place data into rich text passages for RAG Vector Embeddings."""

    @staticmethod
    def generate_rag_passages(place: PlaceEnrichedModel) -> List[Dict[str, Any]]:
        passages = []

        # Passage 1: Overview & General Info
        overview_text = (
            f"Địa điểm: {place.name}. "
            f"Vị trí: {place.address}, {place.commune}, Tri Tôn, An Giang. "
            f"Danh mục: {place.category} ({place.tourism_category}). "
            f"Mô tả: {place.description}. "
            f"Đánh giá: {place.rating} sao ({place.review_count} lượt đánh giá)."
        )
        passages.append({
            "chunk_type": "overview",
            "content": overview_text,
            "metadata": {
                "place_id": place.place_id,
                "name": place.name,
                "commune": place.commune,
                "category": place.tourism_category
            }
        })

        # Passage 2: Visitor Guidance & Best Times
        guidance_text = (
            f"Kinh nghiệm tham quan {place.name}: "
            f"Thời điểm đẹp nhất: {place.best_visit_time}. "
            f"Thời lượng gợi ý: {place.recommended_duration}. "
            f"Giờ mở cửa: {place.opening_hours}. "
            f"Giá vé: {place.price_level}. "
            f"Phù hợp cho: {', '.join(place.suitable_for)}. "
            f"Chỗ đậu xe: {'Có' if place.parking else 'Không'}. "
            f"Wifi: {'Có' if place.wifi else 'Không'}."
        )
        passages.append({
            "chunk_type": "travel_guide",
            "content": guidance_text,
            "metadata": {
                "place_id": place.place_id,
                "name": place.name,
                "suitable_for": place.suitable_for
            }
        })

        return passages
