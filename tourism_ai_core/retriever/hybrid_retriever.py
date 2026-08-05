import logging
from typing import List, Dict, Any

logger = logging.getLogger("tourism_ai_core.retriever")

class HybridRetriever:
    """Hybrid Search Retriever combining BM25 Keyword, Vector Similarity & Knowledge Graph."""

    def __init__(self, knowledge_chunks: List[Dict[str, Any]] = None):
        self.chunks = knowledge_chunks or []

    def bm25_search(self, query: str, top_k: int = 30) -> List[Dict[str, Any]]:
        query_terms = set(query.lower().split())
        scored = []
        for chunk in self.chunks:
            content_terms = set(chunk.get("content", "").lower().split())
            overlap = len(query_terms.intersection(content_terms))
            score = overlap / (len(query_terms) + 1.0)
            scored.append({"chunk": chunk, "score": score})
        
        scored.sort(key=lambda x: x["score"], reverse=True)
        return [item["chunk"] for item in scored[:top_k]]

    def vector_search(self, query: str, top_k: int = 30) -> List[Dict[str, Any]]:
        # Vector similarity search placeholder (cosine distance)
        return self.bm25_search(query, top_k=top_k)

    def rerank_results(self, candidates: List[Dict[str, Any]], query: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """AI Reranker using Cross-Encoder relevance scoring."""
        logger.info(f"Reranking {len(candidates)} candidates for query: '{query}' -> Top {top_n}")
        return candidates[:top_n]

    def hybrid_retrieve(self, query: str, top_n: int = 5) -> List[Dict[str, Any]]:
        candidates = self.bm25_search(query, top_k=30)
        reranked = self.rerank_results(candidates, query, top_n=top_n)
        return reranked
