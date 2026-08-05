import logging
from typing import Dict, Any, List

logger = logging.getLogger("tourism_ai_platform.planner")

class AITripPlanner:
    """AI Itinerary & Tour Planner for 1D and 2D1N Tri Ton Trips."""

    @staticmethod
    def generate_plan(days: int = 2, persona: str = "nature_foodie") -> Dict[str, Any]:
        logger.info(f"Generating {days}-Day Itinerary for Persona '{persona}'...")
        return {
            "title": f"Lịch trình Tri Tôn {days} Ngày 1 Đêm Trải Nghiệm Tinh Hoa Bảy Núi",
            "days": days,
            "persona": persona,
            "schedule": [
                {"day": 1, "morning": "Hồ Tà Pạ & Chùa Xvayton", "noon": "Gà Đốt Ô Thum", "afternoon": "Hồ Soài So"},
                {"day": 2, "morning": "Đồi Tức Dụp & Thốt nốt trái tim", "noon": "Bò 7 món Ba Chúc", "afternoon": "Chợ Tri Tôn"}
            ]
        }
