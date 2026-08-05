import unicodedata
from typing import Dict, Any, List
from tourism_crawler.models.place import PlaceRawModel, PlaceEnrichedModel, generate_slug, normalize_nfc

class PlaceEnrichmentService:
    """Service to automatically enrich scraped place records for AI RAG readiness."""

    @staticmethod
    def enrich_place(raw: PlaceRawModel) -> PlaceEnrichedModel:
        name = normalize_nfc(raw.name)
        address = normalize_nfc(raw.address)
        commune = normalize_nfc(raw.commune)
        desc = normalize_nfc(raw.description)

        slug = generate_slug(name)

        # Map Tourism Category
        lower_name = name.lower()
        lower_cat = (raw.category or "").lower()

        if any(k in lower_name or k in lower_cat for k in ["chùa", "wat", "tâm linh", "di tích", "nhà mồ"]):
            tourism_category = "khmer_pagodas_heritage"
            best_visit_time = "Sáng sớm (07:00 - 09:30)"
            duration = "1 - 1.5 giờ"
            ticket_required = False
        elif any(k in lower_name or k in lower_cat for k in ["gà đốt", "bún nước lèo", "bò 7 món", "quán ăn", "nhà hàng", "đu đủ đâm", "đặc sản"]):
            tourism_category = "food_and_restaurants"
            best_visit_time = "Trưa (11:00 - 13:30) & Tối (17:30 - 20:00)"
            duration = "45 - 60 phút"
            ticket_required = False
        elif any(k in lower_name or k in lower_cat for k in ["cafe", "cà phê", "homestay", "khách sạn", "nhà nghỉ"]):
            tourism_category = "cafes_and_homestays"
            best_visit_time = "Chiều (15:00 - 17:30)"
            duration = "1 - 2 giờ"
            ticket_required = False
        elif any(k in lower_name or k in lower_cat for k in ["cổng trời", "trái tim", "con đường", "check-in", "sống ảo"]):
            tourism_category = "checkin_spots"
            best_visit_time = "Sáng (07:30 - 09:00) & Hoàng hôn (16:30 - 17:30)"
            duration = "30 - 45 phút"
            ticket_required = False
        else:
            tourism_category = "attractions_nature"
            best_visit_time = "Cả ngày (Chiều mát đẹp nhất)"
            duration = "2 - 3 giờ"
            ticket_required = "tức dụp" in lower_name

        # Search Keywords List
        keywords = set([
            name.lower(),
            commune.lower(),
            tourism_category,
            "tri ton",
            "an giang",
            "bay nui",
            "that son"
        ] + [k.lower() for k in raw.keywords])

        travel_tags = list(set([
            tourism_category,
            commune.replace("Xã ", "").replace("Thị trấn ", ""),
            "bảy núi",
            "tri tôn",
            "an giang"
        ] + raw.tags))

        return PlaceEnrichedModel(
            place_id=raw.place_id,
            name=name,
            category=raw.category,
            subcategory=raw.subcategory,
            address=address,
            commune=commune,
            district=raw.district,
            province=raw.province,
            latitude=raw.latitude,
            longitude=raw.longitude,
            google_maps_url=raw.google_maps_url or f"https://maps.google.com/?q={raw.latitude},{raw.longitude}",
            phone=raw.phone,
            website=raw.website,
            business_status=raw.business_status,
            opening_hours=raw.opening_hours,
            price_level=raw.price_level or "Miễn phí",
            rating=raw.rating,
            review_count=raw.review_count,
            photos=raw.photos,
            photo_urls=raw.photo_urls,
            review_samples=raw.review_samples,
            keywords=list(keywords),
            description=desc,
            short_description=raw.short_description or desc[:150],
            tags=travel_tags,
            slug=slug,
            search_keywords=list(keywords),
            tourism_category=tourism_category,
            travel_tags=travel_tags,
            recommended_duration=duration,
            best_visit_time=best_visit_time,
            family_friendly=True,
            couple_friendly=True,
            kids_friendly=True,
            parking=True,
            wifi=tourism_category in ["food_and_restaurants", "cafes_and_homestays"],
            ticket_required=ticket_required,
            confidence_score=95.0,
            is_active=True
        )
