import logging
from typing import List, Dict
from tourism_crawler.models.place import PlaceEnrichedModel

logger = logging.getLogger("tourism_crawler")

class KnowledgeGraphService:
    """Builds Tourism Knowledge Graph Triples (Subject, Relation, Object) for AI Reasoning."""

    @staticmethod
    def build_knowledge_graph(place: PlaceEnrichedModel) -> List[Dict[str, str]]:
        triples = []

        # 1. Location Triples
        triples.append({"subject": place.name, "relation": "LOCATED_IN", "object": place.commune})
        triples.append({"subject": place.commune, "relation": "PART_OF", "object": "Tri Tôn, An Giang"})

        # 2. Category & Feature Triples
        triples.append({"subject": place.name, "relation": "CATEGORY_IS", "object": place.tourism_category})

        # 3. Specialty / Food Triples
        name_lower = place.name.lower()
        if "ô thum" in name_lower or "gà đốt" in name_lower:
            triples.append({"subject": place.name, "relation": "FAMOUS_FOR", "object": "Gà Đốt Lá Chúc Ô Thum"})
        if "bún nước lèo" in name_lower:
            triples.append({"subject": place.name, "relation": "FAMOUS_FOR", "object": "Bún Nước Lèo Mắm Bò Hóc"})
        if "tà pạ" in name_lower:
            triples.append({"subject": place.name, "relation": "HAS_FEATURE", "object": "Nước Hồ Xanh Trong Ngọc"})
            triples.append({"subject": place.name, "relation": "BEST_TIME_TO_VISIT", "object": "Hoàng Hôn & Mùa Lúa Chín"})
        if "thốt nốt" in name_lower:
            triples.append({"subject": place.name, "relation": "FAMOUS_FOR", "object": "Mật Thốt Nốt Tươi & Bánh Bò Thốt Nốt"})
        if "tức dụp" in name_lower:
            triples.append({"subject": place.name, "relation": "HISTORICAL_TYPE", "object": "Căn Cứ Kháng Chiến Cánh Đồng Bảy Núi"})

        # 4. Nearby Places Triples
        for near in place.nearby_places[:3]:
            triples.append({
                "subject": place.name,
                "relation": "NEARBY_SPOT",
                "object": f"{near['name']} ({near['distance_km']} km)"
            })

        return triples
