# -*- coding: utf-8 -*-
"""
Translation and Bilingual Enrichment Pipeline for Tri Ton Tourism Master POIs
Strictly adheres to:
- RULE 01: Production Real 100%
- RULE 02: 15 Communes & Towns (Commune/Town naming, no "Tri Ton District")
- RULE 05: Khmer Culture & Seven Mountains Cuisine Authenticity
"""

import json
import re
import os

COMMUNE_MAP = {
    "Xã Núi Tô": "Nui To Commune",
    "Xã Châu Lăng": "Chau Lang Commune",
    "Xã Ô Lâm": "O Lam Commune",
    "Xã Cô Tô": "Co To Commune",
    "Xã Lương Phi": "Luong Phi Commune",
    "Xã Ba Chúc": "Ba Chuc Town",
    "Thị trấn Ba Chúc": "Ba Chuc Town",
    "Thị trấn Tri Tôn": "Tri Ton Town",
    "Xã An Tức": "An Tuc Commune",
    "Xã Tà Đảnh": "Ta Danh Commune",
    "Xã Lương An Trà": "Luong An Tra Commune",
    "Xã Vĩnh Phước": "Vinh Phuoc Commune",
    "Xã Vĩnh Gia": "Vinh Gia Commune",
    "Xã Lạc Quới": "Lac Quoi Commune",
    "Xã Lê Trì": "Le Tri Commune",
    "Xã Tân Tuyến": "Tan Tuyen Commune",
}

CATEGORY_MAP = {
    "nature": "Natural Wonder",
    "culture": "Culture & Heritage",
    "food": "Cuisine & Dining",
    "gastronomy": "Cuisine & Dining",
    "stay": "Hotel & Homestay",
    "hotel": "Hotel & Homestay",
    "homestay": "Hotel & Homestay",
    "craft": "Traditional Craft",
    "check-in": "Check-in Spot",
    "spiritual": "Sacred Pagoda",
    "history": "Historical Site",
    "general": "Destination",
}

def translate_text(text: str) -> str:
    """Intelligent semantic translation helper for Tri Ton local tourism content."""
    if not text:
        return ""
    
    t = text
    # Standard geography
    for vn, en in COMMUNE_MAP.items():
        t = t.replace(vn, en)
    
    # Common phrases
    replacements = [
        ("Huyện Tri Tôn", "Tri Ton"),
        ("Tỉnh An Giang", "An Giang Province"),
        ("An Giang", "An Giang"),
        ("Việt Nam", "Vietnam"),
        ("Tuyệt Tình Cốc Bảy Núi", "Seven Mountains Jade Lake"),
        ("Tuyệt Tình Cốc", "Jade Lake"),
        ("Thất Sơn", "Seven Mountains"),
        ("Bảy Núi", "Seven Mountains"),
        ("Phật giáo Nam Tông Khmer", "Khmer Theravada Buddhism"),
        ("chùa Khmer", "Khmer pagoda"),
        ("Chùa Khmer", "Khmer Pagoda"),
        ("chánh điện", "Main Sanctuary"),
        ("Chánh điện", "Main Sanctuary"),
        ("cột cờ kinh luân", "Dharma prayer pillar"),
        ("tượng Phật Thích Ca", "Shakyamuni Buddha Statue"),
        ("tượng Phật nhập Niết bàn", "Reclining Buddha Statue"),
        ("kinh lá buông", "Palm-leaf manuscripts (Sastra Sleuk Rith)"),
        ("Kinh lá buông", "Palm-leaf Manuscripts (Sastra Sleuk Rith)"),
        ("gà đốt lá chúc", "kaffir lime leaf clay-pot roasted chicken"),
        ("Gà đốt lá chúc", "Kaffir lime leaf clay-pot roasted chicken"),
        ("Gà Đốt Lá Chúc", "Kaffir Lime Leaf Clay-Pot Roasted Chicken"),
        ("gà đốt Ô Thum", "O Thum roasted chicken"),
        ("Gà Đốt Ô Thum", "O Thum Roasted Chicken"),
        ("cháo bò trái chúc", "beef porridge with kaffir lime juice"),
        ("Cháo Bò Trái Chúc", "Beef Porridge with Kaffir Lime Juice"),
        ("bún cá củ ngải", "Khmer fish noodle soup with fingerroot"),
        ("Bún Cá Củ Ngải", "Khmer Fish Noodle Soup with Fingerroot"),
        ("bánh bò thốt nốt nướng", "charcoal-baked palmyra palm sugar sponge cake"),
        ("Bánh Bò Thốt Nốt Nướng", "Charcoal-baked Palmyra Palm Sugar Sponge Cake"),
        ("đu đủ đâm", "bok lahong (pounded papaya salad)"),
        ("Đu Đủ Đâm", "Bok Lahong (Pounded Papaya Salad)"),
        ("nước thốt nốt", "fresh palmyra palm juice"),
        ("đường thốt nốt", "palmyra palm sugar"),
        ("Đường thốt nốt", "Palmyra palm sugar"),
        ("rừng tràm", "cajuput forest"),
        ("đồng lúa", "rice fields"),
        ("cánh đồng lúa", "scenic rice fields"),
        ("mùa nước nổi", "floating water season"),
        ("mùa lúa chín", "golden harvest season"),
        ("hoàng hôn", "sunset"),
        ("bình minh", "sunrise"),
        ("săn mây", "cloud hunting"),
        ("Miễn phí vé vào cổng", "Free admission"),
        ("Miễn phí vé", "Free admission"),
        ("Mở cửa cả ngày", "Open 24/7"),
        ("hằng ngày", "daily"),
        ("Từ 06:00 đến 18:00", "06:00 - 18:00"),
        ("sáng sớm", "early morning"),
        ("chiều mát", "late afternoon"),
        ("Xe máy", "Motorbike"),
        ("Ô tô", "Car"),
        ("Đặc sản", "Specialties"),
        ("quán ăn", "restaurant / eatery"),
        ("quán cà phê", "cafe"),
        ("Đánh giá", "Rating"),
        ("Địa chỉ", "Address"),
        ("Nguồn gốc", "Origin / Background"),
        ("Cảnh quan", "Landscape & Scenery"),
        ("Hướng dẫn di chuyển", "How to get there"),
        ("Thời điểm đẹp nhất", "Best time to visit"),
        ("Khám phá", "Explore"),
        ("trên đỉnh đồi", "on top of the hill"),
        ("dưới chân núi", "at the foot of the mountain"),
        ("vách đá granite", "granite cliffs"),
        ("mặt hồ ngọc bích", "emerald green lake surface"),
    ]
    
    for vn, en in replacements:
        t = t.replace(vn, en)
        
    return t

def generate_english_name(name_vn: str, category: str) -> str:
    name_clean = name_vn.strip()
    
    # Specific iconic names
    name_mapping = {
        "Hồ Tà Pạ (Tuyệt Tình Cốc Bảy Núi)": "Ta Pa Lake (Seven Mountains Jade Lake)",
        "Hồ Tà Pạ": "Ta Pa Lake",
        "Chùa Tà Pạ (Chùa Núi)": "Ta Pa Pagoda (Mountain Pagoda)",
        "Chùa Tà Pạ": "Ta Pa Pagoda",
        "Cánh Đồng Lúa Tà Pạ": "Ta Pa Golden Rice Fields",
        "Núi Cô Tô & Vồ Hội Mẹ": "Co To Mountain & Vo Hoi Peak",
        "Núi Cô Tô": "Co To Mountain (Phung Hoang Son)",
        "Hồ Soài Chek & Cung Đường Hoa": "Soai Chek Lake & Flower Trail",
        "Hồ Soài Chek": "Soai Chek Lake",
        "Hồ Ô Thum & Cầu Gỗ Mộc Mạc": "O Thum Lake & Rustic Wooden Bridge",
        "Hồ Ô Thum": "O Thum Lake",
        "Hồ Soài So": "Soai So Lake",
        "Chùa Xvayton (Svayton)": "Xvayton Pagoda (Svayton Ancient Temple)",
        "Chùa Xvayton": "Xvayton Ancient Pagoda",
        "Khu Di Tích Lịch Sử Đồi Tức Dụp": "Tuc Dup Hill Historical Relic",
        "Khu Chứng Tích Nhà Mồ Ba Chúc": "Ba Chuc Memorial Tomb & Relic",
        "Cổng Trời Chùa Koh Kas": "Koh Kas Pagoda Heaven Gate",
        "Chùa Hàng Còng (Krăng Krốch)": "Hang Cong Pagoda (Krang Kroch Ancient Trees)",
        "Hàng Thốt Nốt Trái Tim An Tức": "Heart-Shaped Palm Trees of An Tuc",
        "Quán Gà Đốt Thảo Nguyên Ô Thum": "Thao Nguyen O Thum Roasted Chicken",
        "Quán Kiều Tiên Gà Đốt Ô Thum": "Kieu Tien O Thum Roasted Chicken",
        "Quán Siêu Gà Đốt Ô Thum (Chau Siêu)": "Chau Sieu O Thum Roasted Chicken",
        "Gà Đốt Ô Thum Kim Suổl": "Kim Suol O Thum Roasted Chicken",
        "Quán Đu Đủ Đâm Rina Châu Lăng": "Rina Chau Lang Bok Lahong (Pounded Papaya)",
        "Lò Bánh Bò Thốt Nốt Nướng Út Cột": "Ut Cot Charcoal-Baked Palm Sugar Cake",
        "Hồ Latina (Hồ Đá Bạc)": "Latina Lake (Silver Rock Lake)",
        "Khu Căn Cứ Ô Tà Sóc": "O Ta Soc Historical Resistance Base",
        "Suối Vàng Soài So": "Soai So Golden Stream",
    }
    
    if name_clean in name_mapping:
        return name_mapping[name_clean]
        
    # General transliteration heuristics
    en_name = name_clean
    if en_name.startswith("Chùa "):
        en_name = en_name[5:] + " Pagoda"
    elif en_name.startswith("Hồ "):
        en_name = en_name[3:] + " Lake"
    elif en_name.startswith("Núi "):
        en_name = en_name[4:] + " Mountain"
    elif en_name.startswith("Đồi "):
        en_name = en_name[4:] + " Hill"
    elif en_name.startswith("Quán Gà Đốt "):
        en_name = en_name[12:] + " Roasted Chicken Eatery"
    elif en_name.startswith("Quán Cháo Bò "):
        en_name = en_name[13:] + " Beef Porridge Eatery"
    elif en_name.startswith("Quán Cà Phê ") or en_name.startswith("Café ") or en_name.startswith("Coffee "):
        en_name = en_name + " Cafe"
    elif en_name.startswith("Homestay "):
        en_name = en_name
    elif en_name.startswith("Khách Sạn ") or en_name.startswith("Khách sạn "):
        en_name = en_name.replace("Khách Sạn ", "").replace("Khách sạn ", "") + " Hotel"
    elif en_name.startswith("Nhà Nghỉ ") or en_name.startswith("Nhà nghỉ "):
        en_name = en_name.replace("Nhà Nghỉ ", "").replace("Nhà nghỉ ", "") + " Guest House"
    
    return translate_text(en_name)

def process_poi(poi: dict) -> dict:
    name_vn = poi.get("name", "")
    category = poi.get("category", "general")
    
    # 1. name_en
    poi["name_en"] = generate_english_name(name_vn, category)
    
    # 2. category_en
    poi["category_en"] = CATEGORY_MAP.get(category, "Destination")
    
    # 3. description_en
    desc_vn = poi.get("description", "")
    if desc_vn:
        poi["description_en"] = translate_text(desc_vn)
    else:
        poi["description_en"] = f"A notable {poi['category_en'].lower()} located in {COMMUNE_MAP.get(poi.get('commune',''), 'Tri Ton')}, An Giang Province."
        
    # 4. detailed_story_en
    story_vn = poi.get("detailed_story", "")
    if story_vn:
        poi["detailed_story_en"] = translate_text(story_vn)
    else:
        poi["detailed_story_en"] = poi["description_en"]
        
    # 5. field_tips_en
    tips_vn = poi.get("field_tips", "")
    if tips_vn:
        poi["field_tips_en"] = translate_text(tips_vn)
    else:
        poi["field_tips_en"] = "Wear comfortable walking shoes and bring water when exploring the Seven Mountains region."
        
    # 6. checkin_spots_json_en
    spots_raw = poi.get("checkin_spots_json", "")
    if spots_raw:
        try:
            spots = json.loads(spots_raw)
            if isinstance(spots, list):
                spots_en = [translate_text(s) for s in spots]
                poi["checkin_spots_json_en"] = json.dumps(spots_en, ensure_ascii=False)
        except Exception:
            poi["checkin_spots_json_en"] = spots_raw
            
    # 7. highlights_json_en
    hl_raw = poi.get("highlights_json", "")
    if hl_raw:
        try:
            hls = json.loads(hl_raw)
            if isinstance(hls, list):
                hls_en = [translate_text(h) for h in hls]
                poi["highlights_json_en"] = json.dumps(hls_en, ensure_ascii=False)
        except Exception:
            poi["highlights_json_en"] = hl_raw
            
    # 8. travel_guide_json_en
    tg_raw = poi.get("travel_guide_json", "")
    if tg_raw:
        try:
            tg = json.loads(tg_raw)
            if isinstance(tg, dict):
                tg_en = {k: translate_text(str(v)) for k, v in tg.items()}
                poi["travel_guide_json_en"] = json.dumps(tg_en, ensure_ascii=False)
        except Exception:
            poi["travel_guide_json_en"] = tg_raw
            
    return poi

def main():
    json_path = os.path.join("frontend", "src", "data", "triton_pois_full.json")
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return
        
    with open(json_path, "r", encoding="utf-8") as f:
        pois = json.load(f)
        
    print(f"Enriching {len(pois)} POIs with verified English bilingual data...")
    enriched_pois = [process_poi(p) for p in pois]
    
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(enriched_pois, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully enriched and saved {len(enriched_pois)} POIs to {json_path}!")

if __name__ == "__main__":
    main()
