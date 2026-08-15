import sys
import json
import re
import csv

sys.stdout.reconfigure(encoding='utf-8')

def perfect_unpack_story(text: str) -> str:
    if not text or not isinstance(text, str) or len(text.strip()) < 30:
        return text or ""

    # 1. Cultural term standardizations
    text = text.replace("gà nướng đất", "gà đốt đất")
    text = text.replace("Gà nướng đất", "Gà đốt đất")
    text = text.replace("gà nướng Ô Thum", "gà đốt Ô Thum")
    text = text.replace("gà nướng", "gà đốt")
    text = text.replace("Gà nướng", "Gà đốt")
    text = text.replace("Huyện Tri Tôn", "Tri Tôn")

    # 2. Fix squashed dot-numbers e.g. "viễn.4. Hướng Dẫn" -> "viễn.\n\n4. Hướng Dẫn"
    text = re.sub(r'(\.)([1-9]\.)', r'\1\n\n\2', text)
    text = re.sub(r'([a-zà-ỹ])([1-9]\.\s*)', r'\1\n\n\2', text)

    # 3. Fix glued known phrases
    glued_pairs = [
        ("Địa LýVị trí hành chính", "Địa Lý\n\n- **Vị trí hành chính:** "),
        ("Sơn DânRừng tầm vông", "Sơn Dân\n\n- **Rừng tầm vông & Vườn cây ăn trái:** "),
        ("Tâm LinhNúi Dài không chỉ", "Tâm Linh\n\nNúi Dài không chỉ"),
        ("Khám PháPhương tiện", "Khám Phá\n\n- **Phương tiện:** "),
        ("QuanAn toàn", "Quan\n\n- **An toàn:** "),
        ("thanh sạch.Thưởng thức", "thanh sạch.\n\n- **Thưởng thức ẩm thực:** "),
        ("hào hùng:Khu Căn cứ", "hào hùng:\n\n- **Khu Căn cứ Cách mạng Ô Tà Sóc:** "),
        ("tuyến đường 1C.Hồ Ô Tà Sóc", "tuyến đường 1C.\n\n- **Hồ Ô Tà Sóc:** "),
        ("rải rác trên sườn núi, là chốn", "rải rác trên sườn núi, là chốn"),
    ]
    for old, new in glued_pairs:
        text = text.replace(old, new)

    # 4. Insert section headings for numbered items
    text = re.sub(r'(?<!\n\n)(?:\s+|^)([1-9]\.\s+[^\n:\.]{3,45}?)(?=\n|$|\.\s)', r'\n\n### \1\n\n', text)

    # 5. Known labels
    labels = [
        "Vị trí hành chính", "Vị trí", "Quy mô", "Lưu ý phân biệt",
        "Núi Dài Lớn (Ngọa Long Sơn)", "Núi Dài Nhỏ (Ngũ Hồ Sơn / Núi Dài Năm Giếng)",
        "Rừng tầm vông & Vườn cây ăn trái", "Hệ thống suối & Điểm tập kết nông sản",
        "Khu Căn cứ Cách mạng Ô Tà Sóc", "Đồi Ma Thiên Lãnh & Hang Quân Y, Điện Trời Gầm",
        "Hồ Ô Tà Sóc", "Điện Tàu Cau & Các am cốc tu tập", "Phương tiện", "Trekking khám phá",
        "Thưởng thức ẩm thực", "An toàn", "Tôn nghiêm & Môi trường", "Giờ mở cửa", "Giá vé",
        "Thời điểm đẹp nhất", "Thời điểm lý tưởng", "Góc chụp ảnh đẹp", "Mẹo trải nghiệm",
        "Kinh nghiệm thực địa", "Đặc sản nổi bật", "Bí quyết thưởng thức", "Cách đi lại"
    ]
    for lbl in labels:
        # Avoid double replacement
        text = re.sub(rf'(?<!\n- \*\*)(?<!### )({re.escape(lbl)}:)', rf'\n- **{lbl}:**', text)

    # 6. Cleanup duplicate colons or accidental duplicates
    text = re.sub(r':\*\*:', ':**', text)
    text = re.sub(r'- \*\*([^\*]+):\*\*\s*& Vườn cây ăn trái:', r'- **\1:**', text)
    text = re.sub(r'- \*\*([^\*]+):\*\*\s*ẩm thực:', r'- **\1:**', text)
    text = re.sub(r'- \*\*([^\*]+):\*\*\s*:\s*', r'- **\1:** ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    
    return text.strip()

# Load master pois
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

count = 0
for p in pois:
    story = p.get('detailed_story')
    if story and len(story) > 30:
        cleaned = perfect_unpack_story(story)
        if cleaned != story:
            p['detailed_story'] = cleaned
            count += 1

print(f"Cleaned and formatted {count} POI stories!")

# Save to local master files
with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print("Saved to data/triton_pois_full.json and frontend/src/data/triton_pois_full.json!")
