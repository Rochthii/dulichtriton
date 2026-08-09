import re
from difflib import SequenceMatcher
from typing import Dict, List, Any

# Keyword mapping to POI IDs in data/tri_ton_master_cleaned.csv
POI_KEYWORDS: Dict[str, List[str]] = {
    "ho-ta-pa": ["tà pạ", "ta pa", "tuyệt tình cốc", "tuyet tinh coc", "hồ tà pạ"],
    "ho-o-thum": ["ô thum", "o thum", "hồ ô thum", "gà đốt ô thum"],
    "chua-ta-pa": ["chùa tà pạ", "chua ta pa", "núi tà pạ"],
    "chua-koh-kas": ["koh kas", "cổng trời", "cong troi", "chùa koh kas", "chùa lăng"],
    "nui-co-to": ["núi cô tô", "nui co to", "phụng hoàng sơn", "vọng thiên đài"],
    "chua-xay-ton": ["xà tón", "xa ton", "xvayton", "chùa xà tón"],
    "canh-dong-thot-not": ["hàng thốt nốt", "cánh đồng thốt nốt", "trái tim thốt nốt"],
    "ga-dot-o-thum": ["gà đốt", "ga dot", "gà đốt ô thum", "đặc sản gà đốt"],
    "chao-bo-trai-truc": ["cháo bò", "chao bo", "cháo bò lá trúc", "cháo bò tri tôn"],
    "bun-nuoc-leo-khmer": ["bún nước lèo", "bun nuoc leo", "bún nước lèo khmer"],
    "banh-bo-thot-not": ["bánh bò thốt nốt", "banh bo thot not"],
    "dua-bo-bay-nui": ["đua bò", "dua bo", "lễ hội đua bò", "đua bò bảy núi"],
}

def match_video_to_pois(title: str, hashtags: List[str]) -> List[Dict[str, Any]]:
    """
    Gắn video với các POI liên quan dựa trên title + hashtags.
    Returns list of matched POI objects: [{"poi_id": "ho-ta-pa", "confidence": 0.85}]
    """
    text_corpus = f"{title or ''} {' '.join(hashtags or [])}".lower()
    matched = []

    for poi_id, keywords in POI_KEYWORDS.items():
        best_confidence = 0.0
        for kw in keywords:
            if kw in text_corpus:
                best_confidence = max(best_confidence, 0.90)
            else:
                # Fuzzy match ratio
                ratio = SequenceMatcher(None, kw, text_corpus).ratio()
                if ratio > 0.4:
                    best_confidence = max(best_confidence, round(ratio, 2))

        if best_confidence >= 0.40:
            matched.append({"poi_id": poi_id, "confidence": best_confidence})

    # Sort descending by confidence, keep top 3
    matched.sort(key=lambda x: x["confidence"], reverse=True)
    return matched[:3]
