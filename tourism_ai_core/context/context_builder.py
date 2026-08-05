import logging
import re
from typing import Dict, Any, List, Optional

logger = logging.getLogger("tourism_ai_core.context")

class EntityExtractor:
    """Extracts entities (Time, Location, Food, Companion, Vehicle) from User Query."""

    @staticmethod
    def extract_entities(query: str) -> Dict[str, Any]:
        query_lower = query.lower()
        entities = {
            "time_slot": None,
            "location": None,
            "category": None,
            "companions": "general",
            "vehicle": "motorcycle"
        }

        # Time extraction
        if any(t in query_lower for t in ["sáng", "7h", "8h", "9h"]):
            entities["time_slot"] = "morning"
        elif any(t in query_lower for t in ["trưa", "11h", "12h", "13h"]):
            entities["time_slot"] = "noon"
        elif any(t in query_lower for t in ["chiều", "15h", "16h", "17h"]):
            entities["time_slot"] = "afternoon"
        elif any(t in query_lower for t in ["tối", "18h", "19h", "20h"]):
            entities["time_slot"] = "evening"

        # Companions
        if "gia đình" in query_lower or "trẻ em" in query_lower:
            entities["companions"] = "family"
        elif "người yêu" in query_lower or "cặp đôi" in query_lower or "2 người" in query_lower:
            entities["companions"] = "couple"
        elif "phượt" in query_lower or "1 mình" in query_lower:
            entities["companions"] = "solo"

        # Vehicle
        if "ô tô" in query_lower or "xe 7 chỗ" in query_lower:
            entities["vehicle"] = "car"

        return entities

class MemoryManager:
    """Manages multi-turn conversation memory and session state."""

    def __init__(self):
        self.session_memory: Dict[str, List[Dict[str, str]]] = {}

    def add_turn(self, session_id: str, user_msg: str, assistant_msg: str):
        if session_id not in self.session_memory:
            self.session_memory[session_id] = []
        self.session_memory[session_id].append({"user": user_msg, "assistant": assistant_msg})

    def get_history(self, session_id: str, max_turns: int = 5) -> List[Dict[str, str]]:
        return self.session_memory.get(session_id, [])[-max_turns:]

class ContextBuilder:
    """Builds unified context combining Entities, Conversation Memory & System State."""

    def __init__(self, memory_manager: MemoryManager = None):
        self.memory = memory_manager or MemoryManager()

    def build_context(self, session_id: str, user_query: str, gps_coords: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        entities = EntityExtractor.extract_entities(user_query)
        history = self.memory.get_history(session_id)

        context = {
            "session_id": session_id,
            "user_query": user_query,
            "entities": entities,
            "conversation_history": history,
            "gps_coordinates": gps_coords or {"latitude": 10.413, "longitude": 105.008},
            "current_season": "Mùa Nước Nổi & Lúa Chín Bảy Núi"
        }
        logger.info(f"Built Context for Session '{session_id}': {entities}")
        return context
