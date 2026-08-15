import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

# Re-load original raw CSV text for Nui Dai
import csv
with open('data/database_du_lich_tri_ton_v3.csv', mode='r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for r in reader:
        if 'Núi Dài' in r.get('Tên địa điểm', ''):
            raw_text = r.get('Mô tả chi tiết (Nội dung Website)')

def perfect_story_unpacker(text: str) -> str:
    if not text:
        return ""
    
    # Cultural replacements
    text = text.replace("gà nướng đất", "gà đốt đất")
    text = text.replace("Gà nướng đất", "Gà đốt đất")
    text = text.replace("gà nướng", "gà đốt")
    text = text.replace("Gà nướng", "Gà đốt")
    text = text.replace("Huyện Tri Tôn", "Tri Tôn")

    # 1. Break glued dot-numbers like "viễn.4. Hướng Dẫn" -> "viễn.\n\n4. Hướng Dẫn"
    text = re.sub(r'(\.)([1-9]\.)', r'\1\n\n\2', text)
    text = re.sub(r'([a-zà-ỹ])([1-9]\.\s*)', r'\1\n\n\2', text)

    # 2. Break glued colon-words like "hùng:Khu Căn cứ" -> "hùng:\n- **Khu Căn cứ:**"
    text = re.sub(r':([A-ZÀ-Ỵ])', r':\n\n\1', text)

    # 3. Known label phrases that got glued to previous titles
    glued_labels = [
        ("Địa LýVị trí hành chính", "Địa Lý\n\n- **Vị trí hành chính:**"),
        ("Sơn DânRừng tầm vông", "Sơn Dân\n\n- **Rừng tầm vông & Vườn cây ăn trái:**"),
        ("Tâm LinhNúi Dài không chỉ", "Tâm Linh\n\nNúi Dài không chỉ"),
        ("Khám PháPhương tiện", "Khám Phá\n\n- **Phương tiện:**"),
        ("QuanAn toàn", "Quan\n\n- **An toàn:**"),
        ("thanh sạch.Thưởng thức", "thanh sạch.\n\n- **Thưởng thức ẩm thực:**"),
        ("hào hùng:Khu Căn cứ", "hào hùng:\n\n- **Khu Căn cứ Cách mạng Ô Tà Sóc:**"),
        ("tuyến đường 1C.Hồ Ô Tà Sóc", "tuyến đường 1C.\n\n- **Hồ Ô Tà Sóc:**"),
        ("các am cốc tu tập", "- **Điện Tàu Cau & Các am cốc tu tập:**"),
    ]
    for old, new in glued_labels:
        text = text.replace(old, new)

    # 4. Detect numbered sections like "1. Vị Trí...", "2. Cảnh Quan...", "3. Di Tích...", "4. Hướng Dẫn...", "5. Lưu Ý..."
    text = re.sub(r'(?<!\n\n)(?:\s+|^)([1-9]\.\s+[^\n:\.]{3,40}?)(?=\n|$|\.\s)', r'\n\n### \1\n\n', text)

    # 5. Format remaining sub-labels ending in colon into bullet points: - **Label:**
    sub_labels = [
        "Vị trí hành chính", "Vị trí", "Quy mô", "Lưu ý phân biệt", "Núi Dài Lớn (Ngọa Long Sơn)",
        "Núi Dài Nhỏ (Ngũ Hồ Sơn / Núi Dài Năm Giếng)", "Rừng tầm vông & Vườn cây ăn trái",
        "Hệ thống suối & Điểm tập kết nông sản", "Khu Căn cứ Cách mạng Ô Tà Sóc",
        "Đồi Ma Thiên Lãnh & Hang Quân Y, Điện Trời Gầm", "Hồ Ô Tà Sóc",
        "Điện Tàu Cau & Các am cốc tu tập", "Phương tiện", "Trekking khám phá",
        "Thưởng thức ẩm thực", "An toàn", "Tôn nghiêm & Môi trường", "Giờ mở cửa",
        "Giá vé", "Mùa đẹp nhất", "Thời điểm lý tưởng", "Gợi ý check-in"
    ]
    for lbl in sub_labels:
        # Check if text has "lbl:" not yet formatted with - **
        pattern = rf'(?<!\n- \*\*)(?<!### )({re.escape(lbl)}:)'
        text = re.sub(pattern, rf'\n- **{lbl}:**', text)

    # Clean multiple newlines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

formatted = perfect_story_unpacker(raw_text)
print("=== PERFECTLY UNPACKED NUI DAI STORY ===")
print(formatted)
