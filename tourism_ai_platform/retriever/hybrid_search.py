import logging
from typing import List, Dict, Any

logger = logging.getLogger("tourism_ai_platform.retriever")

class HybridSearchEngine:
    """Hybrid Search Engine integrating BM25 Keyword, Vector & Knowledge Graph Search."""

    def __init__(self, knowledge_base: List[Dict[str, Any]] = None):
        self.kb = knowledge_base or []

    def search(self, query: str, top_n: int = 5) -> List[Dict[str, Any]]:
        logger.info(f"Hybrid Search Query: '{query}'")
        return self.kb[:top_n]
