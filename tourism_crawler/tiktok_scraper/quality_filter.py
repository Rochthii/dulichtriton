from typing import Dict, Any

MIN_VIEW_COUNT = 500
MIN_DURATION_SEC = 5

def calculate_quality_score(video_data: Dict[str, Any]) -> float:
    """
    Tính điểm chất lượng (Quality Score 0.00 -> 1.00) dựa trên view count, likes, comments & engagement rate.
    """
    views = video_data.get("view_count") or 0
    likes = video_data.get("like_count") or 0
    comments = video_data.get("comment_count") or 0
    shares = video_data.get("share_count") or 0

    if views < MIN_VIEW_COUNT:
        return 0.0

    # View score (max 0.40 at 100k views)
    view_score = min(views / 100000.0, 1.0) * 0.40

    # Engagement rate score (likes+comments+shares / views, max 0.40)
    engagement_rate = ((likes + (comments * 2) + (shares * 3)) / max(views, 1))
    engagement_score = min(engagement_rate * 5.0, 1.0) * 0.40

    # POI relevance bonus (0.20 if POI matched)
    poi_bonus = 0.20 if (video_data.get("matched_pois") and len(video_data["matched_pois"]) > 0) else 0.05

    total_score = round(view_score + engagement_score + poi_bonus, 2)
    return min(total_score, 1.0)

def is_quality_video(video_data: Dict[str, Any]) -> bool:
    """Kiểm tra video có đủ điều kiện lưu trữ vào database không."""
    views = video_data.get("view_count") or 0
    duration = video_data.get("duration") or 0

    if views < MIN_VIEW_COUNT:
        return False
    if duration > 0 and duration < MIN_DURATION_SEC:
        return False

    return True
