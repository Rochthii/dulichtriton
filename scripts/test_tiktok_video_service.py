import json
from tourism_crawler.services.tiktok_video_service import TikTokVideoService

def test_chatbot_tiktok_query():
    service = TikTokVideoService()
    
    test_queries = [
        "Hồ Tà Pạ",
        "Con Đường Tuyến Tránh Tri Tôn",
        "Quán Siêu Gà Đốt Ô Thum",
        "Chùa Cổng Trời Koh Kas",
        "Ruộng Coffee"
    ]
    
    print("==================================================")
    print("DEMO: CHATBOT TIKTOK VIDEO SEARCH & EMBED SERVICE")
    print("==================================================\n")
    
    for query in test_queries:
        result = service.get_tiktok_videos_for_place(query)
        print(f"📌 ĐỊA ĐIỂM: {result['place_name']} ({result['place_id']})")
        print(f"📍 Địa chỉ: {result['address']}")
        print(f"🔗 Link Tìm Kiếm TikTok Trực Tiếp: {result['tiktok_search_url']}")
        print("🎥 DANH SÁCH VIDEO CHATBOT HIỂN THỊ:")
        for vid in result["videos"]:
            print(f"   - Title: {vid['title']}")
            print(f"     Author: {vid['author']}")
            print(f"     Hashtags: {' '.join(vid['hashtags'])}")
            print(f"     Direct TikTok Search: {vid['tiktok_search_url']}")
        print("-" * 60 + "\n")

if __name__ == "__main__":
    test_chatbot_tiktok_query()
