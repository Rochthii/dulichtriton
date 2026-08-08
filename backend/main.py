import os
import json
import re
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("triton_api")

app = FastAPI(title="Tri Tôn Tourism AI — RAG API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Supabase Client ─────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""))
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─── Models ───────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    query: str
    session_id: str = "default_session"

# ─── Intent Detection & Domain Boundary Guard ──────────────────────────────────
OUT_OF_SCOPE_KEYWORDS = [
    "thời sự", "chứng khoán", "bóng đá", "thời tiết hà nội", "thời tiết sài gòn", "java", "python", "lập trình",
    "du lịch đà nẵng", "du lịch đà lạt", "du lịch phú quốc", "du lịch hà nội", "du lịch pháp", "tổng thống"
]

def detect_intent(query: str) -> dict:
    """Keyword-based intent router with strict Tri Tôn Domain Boundary Guard."""
    q = query.lower().strip()

    food_keywords = ["ăn", "quán", "gà đốt", "bún", "cơm", "đặc sản", "thốt nốt", "bánh", "food", "nhà hàng", "quán ăn"]
    stay_keywords = ["homestay", "ở đâu", "khách sạn", "lưu trú", "ngủ", "hotel", "resort", "nhà nghỉ"]
    route_keywords = ["lịch trình", "tour", "kế hoạch", "đi đâu", "hành trình", "trip", "2n1đ", "2 ngày"]
    place_keywords = ["chùa", "hồ", "núi", "suối", "đồi", "di tích", "thác", "vườn", "khu du lịch", "điểm đến", "tham quan"]

    if any(k in q for k in OUT_OF_SCOPE_KEYWORDS):
        return {"intent": "out_of_scope"}

    if any(k in q for k in route_keywords):
        return {"intent": "get_route"}
    if any(k in q for k in food_keywords):
        return {"intent": "find_food"}
    if any(k in q for k in stay_keywords):
        return {"intent": "find_stay"}
    if any(k in q for k in place_keywords):
        return {"intent": "find_place"}
    return {"intent": "general"}

# ─── Supabase Queries ─────────────────────────────────────────────────────────
def query_places(category_filter: str = None, limit: int = 3) -> list:
    """Query Supabase places table with optional category filter."""
    try:
        q = supabase.table("places").select(
            "id, name, commune, tourism_category, category, description, rating, latitude, longitude, photos"
        ).eq("is_active", True).order("rating", desc=True).limit(limit)
        
        if category_filter:
            q = q.eq("tourism_category", category_filter)
        
        result = q.execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Supabase query error: {e}")
        return []

def query_videos_for_places(place_ids: list, limit: int = 2) -> list:
    """Query Supabase videos table for given place_ids."""
    if not place_ids:
        return []
    try:
        result = supabase.table("videos").select(
            "id, title, embed_url, platform, view_count, author_name, thumbnail_url, hashtags"
        ).in_("place_id", place_ids).order("view_count", desc=True).limit(limit).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Supabase video query error: {e}")
        return []

# ─── Response Builders ────────────────────────────────────────────────────────
def build_place_card(place: dict) -> dict:
    """Convert Supabase place row to frontend UI component card."""
    photos = place.get("photos") or []
    image_url = (photos[0].get("url") if photos and isinstance(photos[0], dict) else photos[0]) if photos else ""
    return {
        "type": "place_card",
        "id": place.get("id", ""),
        "name": place.get("name", ""),
        "commune": place.get("commune", ""),
        "category": place.get("category") or place.get("tourism_category", ""),
        "imageUrl": image_url,
        "rating": place.get("rating", 4.5),
        "latitude": place.get("latitude"),
        "longitude": place.get("longitude"),
    }

def build_video_card(video: dict) -> dict:
    """Convert Supabase video row to frontend video embed card."""
    return {
        "title": video.get("title", ""),
        "views": f"{(video.get('view_count') or 0):,} lượt xem",
        "imageUrl": video.get("thumbnail_url", ""),
        "embedUrl": video.get("embed_url", ""),
        "creator": video.get("author_name", ""),
    }

# ─── Intent Handlers ──────────────────────────────────────────────────────────
def handle_find_food(query: str) -> dict:
    places = query_places(category_filter="food_and_restaurants", limit=3)
    if not places:
        # Fallback to any place with food-related name
        places = query_places(limit=3)
    
    place_ids = [p["id"] for p in places]
    videos = query_videos_for_places(place_ids, limit=2)
    
    names = [p["name"] for p in places[:2]]
    text = f"Tôi đã tìm thấy {len(places)} địa điểm ẩm thực tại Tri Tôn cho bạn! Nổi bật nhất là {', '.join(names)}. Các món đặc sản vùng Bảy Núi như Gà đốt Ô Thum, Mắm cá Linh, Bánh thốt nốt... đều rất đáng thử!"

    return {
        "text_response": text,
        "ui_components": [build_place_card(p) for p in places],
        "videos": [build_video_card(v) for v in videos],
        "suggestions": ["Ăn gì ngon ở Núi Tô?", "Quán nào ngon nhất gần Hồ Tà Pạ?", "Đặc sản mua về làm quà"]
    }

def handle_find_stay(query: str) -> dict:
    places = query_places(category_filter="cafes_and_homestays", limit=3)
    place_ids = [p["id"] for p in places]
    videos = query_videos_for_places(place_ids, limit=1)
    
    text = f"Tôi tìm thấy {len(places)} lựa chọn homestay & chỗ ở tại Tri Tôn. Các homestay view núi Cô Tô và cánh đồng thốt nốt rất được GenZ check-in nhiều nhất!"
    
    return {
        "text_response": text,
        "ui_components": [build_place_card(p) for p in places],
        "videos": [build_video_card(v) for v in videos],
        "suggestions": ["Homestay nào có view đẹp nhất?", "Giá phòng khoảng bao nhiêu?", "Có sân BBQ không?"]
    }

def handle_find_place(query: str) -> dict:
    q_lower = query.lower()
    
    # Detect specific category from keywords
    if any(k in q_lower for k in ["chùa", "phật", "khmer"]):
        places = query_places(category_filter="khmer_pagodas_heritage", limit=3)
    elif any(k in q_lower for k in ["hồ", "núi", "thiên nhiên", "thác", "suối"]):
        places = query_places(category_filter="attractions_nature", limit=3)
    elif any(k in q_lower for k in ["check-in", "sống ảo", "checkin"]):
        places = query_places(category_filter="checkin_spots", limit=3)
    else:
        places = query_places(limit=3)
    
    place_ids = [p["id"] for p in places]
    videos = query_videos_for_places(place_ids, limit=2)
    
    names = [p["name"] for p in places[:2]]
    text = f"Tôi tìm thấy {len(places)} địa điểm phù hợp tại Tri Tôn! Nổi bật nhất gồm: {', '.join(names)}. Bạn muốn tôi gợi ý lịch trình cụ thể không?"
    
    return {
        "text_response": text,
        "ui_components": [build_place_card(p) for p in places],
        "videos": [build_video_card(v) for v in videos],
        "suggestions": ["Lịch trình 2 ngày 1 đêm", "Địa điểm check-in đẹp", "Điểm đến ít người biết"]
    }

def handle_get_route(query: str) -> dict:
    # Lấy top 4 địa điểm nổi bật từ DB để ghép lịch trình
    places = query_places(limit=4)
    place_ids = [p["id"] for p in places]
    videos = query_videos_for_places(place_ids, limit=1)
    
    spots = [f"{p['name']} ({p['commune']})" for p in places]
    text = (
        "Lộ trình 2 ngày 1 đêm tối ưu tại Tri Tôn:\n"
        f"- Sáng ngày 1: {spots[0] if len(spots) > 0 else 'Hồ Tà Pạ'}\n"
        f"- Trưa ngày 1: Ăn đặc sản Gà Đốt Ô Thum (Xã Ô Lâm)\n"
        f"- Chiều ngày 1: {spots[1] if len(spots) > 1 else 'Chùa Tà Pạ'}\n"
        f"- Ngày 2: {spots[2] if len(spots) > 2 else 'Đồi Tức Dụp (Xã An Tức)'}\n"
        "- Mua đặc sản thốt nốt về làm quà tại Thị trấn Tri Tôn."
    )
    
    return {
        "text_response": text,
        "ui_components": [build_place_card(p) for p in places[:2]],
        "videos": [build_video_card(v) for v in videos],
        "suggestions": ["Lịch trình 1 ngày", "Đi theo nhóm bạn", "Đặt Homestay gần Tà Pạ"]
    }

def handle_general(query: str) -> dict:
    places = query_places(limit=2)
    place_names = ", ".join([p["name"] for p in places])
    
    # Prompt synthesis with real Supabase context
    ai_prompt = (
        f"Bạn là Trợ lý Du Lịch AI chuyên sâu về Tri Tôn, An Giang, Việt Nam. "
        f"Hãy trả lời thân thiện, chính xác 2-3 câu ngắn gọn cho câu hỏi của du khách: '{query}'. "
        f"Gợi ý du khách tham quan các điểm nổi bật như: {place_names}."
    )
    
    from ai_provider import generate_ai_response
    ai_result = generate_ai_response(ai_prompt)
    
    text = ai_result.get("text")
    if not text:
        text = (
            "Tri Tôn là vùng đất đặc biệt với văn hóa Khmer độc đáo, thiên nhiên hùng vĩ vùng Bảy Núi "
            "và ẩm thực đặc sản như Gà đốt Ô Thum, Mắm cá Linh, Bánh thốt nốt. "
            "Bạn muốn tôi gợi ý cụ thể điểm đến, ẩm thực hay lịch trình không?"
        )
    
    return {
        "text_response": text,
        "ui_components": [build_place_card(p) for p in places],
        "videos": [],
        "suggestions": ["Gợi ý lịch trình 2N1Đ", "Ăn gì ở Tri Tôn?", "Chùa Khmer nào đẹp nhất?"]
    }

# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.post("/api/v1/chat/query")
async def chat_query(request: ChatRequest):
    try:
        intent_data = detect_intent(request.query)
        intent = intent_data["intent"]
        logger.info(f"Query: '{request.query}' → Intent: {intent}")
        
        if intent == "out_of_scope":
            return {
                "intent": "out_of_scope",
                "session_id": request.session_id,
                "text_response": "Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này.",
                "ui_components": [],
                "videos": [],
                "suggestions": ["Gợi ý tour Tri Tôn 2N1Đ", "Ăn gì ở Tri Tôn?", "Check-in Hồ Tà Pạ"]
            }
        elif intent == "find_food":
            result = handle_find_food(request.query)
        elif intent == "find_stay":
            result = handle_find_stay(request.query)
        elif intent == "find_place":
            result = handle_find_place(request.query)
        elif intent == "get_route":
            result = handle_get_route(request.query)
        else:
            result = handle_general(request.query)
        
        result["intent"] = intent
        result["session_id"] = request.session_id
        return result

    except Exception as e:
        logger.error(f"Chat query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Tri Ton Tourism AI RAG API"}
