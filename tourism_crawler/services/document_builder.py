import os
import logging
from typing import List, Dict, Any
from tourism_crawler.models.place import PlaceEnrichedModel

logger = logging.getLogger("tourism_crawler")

class DocumentBuilderService:
    """Builds rich, structured Markdown knowledge documents for RAG system."""

    @staticmethod
    def build_markdown_document(place: PlaceEnrichedModel) -> str:
        nearby_str = "\n".join([f"- **{n['name']}** ({n['distance_km']} km)" for n in place.nearby_places[:3]]) or "- Chưa có thông tin"
        suitable_str = ", ".join(place.suitable_for) if place.suitable_for else "Gia đình, Cặp đôi"
        tags_str = "\n".join([f"- {t}" for t in place.travel_tags])

        md_content = f"""# {place.name}

## 1. TỔNG QUAN
{place.description}

## 2. THÔNG TIN HÀNH CHÍNH & VỊ TRÍ
- **Địa chỉ**: {place.address}
- **Xã/Thị trấn**: {place.commune}
- **Huyện/Tỉnh**: Tri Tôn, An Giang
- **Tọa độ GPS**: [{place.latitude}, {place.longitude}]
- **Google Maps**: {place.google_maps_url}

## 3. THÔNG TIN THAM QUAN
- **Giờ mở cửa**: {place.opening_hours}
- **Giá vé**: {place.price_level}
- **Thời lượng khuyến nghị**: {place.recommended_duration}
- **Thời điểm đẹp nhất**: {place.best_visit_time}
- **Đánh giá**: {place.rating} sao ({place.review_count} lượt đánh giá)

## 4. ĐỊA ĐIỂM PHÙ HỢP CHO
- {suitable_str}

## 5. TIỆN ÍCH & RÀNG BUỘC
- **Chỗ đậu xe**: {'Có bãi đậu xe' if place.parking else 'Tự túc'}
- **Wifi**: {'Có wifi' if place.wifi else 'Không'}
- **Cần mua vé**: {'Cần mua vé vào cổng' if place.ticket_required else 'Vào cổng tự do miễn phí'}

## 6. ĐỊA ĐIỂM LÂN CẬN (< 5KM)
{nearby_str}

## 7. TAGS TRA CỨU
{tags_str}
"""
        return md_content.strip()

    @staticmethod
    def generate_all_documents(places: List[PlaceEnrichedModel], output_dir: str = "storage/enriched/documents") -> List[Dict[str, Any]]:
        os.makedirs(output_dir, exist_ok=True)
        docs = []

        for p in places:
            content = DocumentBuilderService.build_markdown_document(p)
            doc_file = os.path.join(output_dir, f"{p.slug}.md")
            with open(doc_file, "w", encoding="utf-8") as f:
                f.write(content)

            docs.append({
                "place_id": p.place_id,
                "name": p.name,
                "slug": p.slug,
                "path": doc_file,
                "markdown_content": content
            })

        logger.info(f"Generated {len(docs)} rich structured Markdown knowledge documents at {output_dir}")
        return docs
