import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

def auto_format_story(text: str) -> str:
    if not text or not isinstance(text, str):
        return ""
    
    # 1. Standardize cultural terms
    text = text.replace("gà nướng đất", "gà đốt đất")
    text = text.replace("gà nướng", "gà đốt")
    text = text.replace("Huyện Tri Tôn", "Tri Tôn")

    # 2. Fix squashed section numbers e.g. "1. Vị Trí & Đặc Điểm Địa LýVị trí hành chính:"
    # Insert newline before numbered sections like "1. ", "2. ", "3. ", "4. ", "5. ", "6. "
    text = re.sub(r'(\s*)(\d+\.\s+[A-ZÀ-Ỹ][^\.\n:]+?)(?=[A-ZÀ-Ỹ][a-zà-ỹ]+:|[A-ZÀ-Ỹ][a-zà-ỹ]+\s*&|\n|$)', r'\n\n### \2\n\n', text)
    
    # Also fix if ### wasn't added because of pattern
    text = re.sub(r'(?<!\n\n)(###\s+\d+\.[^\n]+)', r'\n\n\1\n\n', text)

    # 3. Fix common subtitles like "Vị trí hành chính:", "Quy mô:", "Lưu ý phân biệt:", "Phương tiện:", "Trekking khám phá:", "Thưởng thức ẩm thực:", "An toàn:", "Tôn nghiêm & Môi trường:", "Đặc sản nổi bật:", "Thời điểm lý tưởng:"
    labels = [
        "Vị trí hành chính", "Vị trí & Cách di chuyển", "Quy mô", "Lưu ý phân biệt",
        "Rừng tầm vông & Vườn cây ăn trái", "Hệ thống suối & Điểm tập kết nông sản",
        "Khu Căn cứ Cách mạng Ô Tà Sóc", "Đồi Ma Thiên Lãnh & Hang Quân Y, Điện Trời Gầm",
        "Hồ Ô Tà Sóc", "Điện Tàu Cau & Các am cốc tu tập", "Phương tiện", "Trekking khám phá",
        "Thưởng thức ẩm thực", "An toàn", "Tôn nghiêm & Môi trường", "Thời điểm lý tưởng",
        "Mẹo sống ảo", "Gợi ý trải nghiệm", "Đặc sản không thể bỏ qua", "Lịch sử hình thành",
        "Kiến trúc độc đáo", "Bí quyết chọn gà", "Thời gian chế biến", "Nước chấm độc quyền",
        "Cảnh quan thiên nhiên", "Di sản văn hóa", "Lưu ý trang phục", "Giá vé & Chi phí",
        "Góc chụp ảnh đẹp", "Kinh nghiệm du khách"
    ]
    for lbl in labels:
        # If label is preceded by text without newline or bold, add newline and bold
        pattern = rf'({re.escape(lbl)}:)'
        text = re.sub(rf'(?<!\n- \*\*)(?<!### )(?<!\n){pattern}', rf'\n\n- **\1**', text)
        text = re.sub(rf'\n- \*\*{re.escape(lbl)}:\*\*', rf'\n- **{lbl}:**', text) # cleanup

    # 4. Clean up multiple newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    return text

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

print(f"Loaded {len(pois)} POIs.")
nui_dai = next(x for x in pois if x.get('slug') == 'nui-dai' or x.get('id') == 'nui-dai')
raw = nui_dai.get('detailed_story')
formatted = auto_format_story(raw)

print("=== BEFORE AUTO-FORMAT (FIRST 250 CHARS) ===")
print(raw[:250])
print("\n=== AFTER AUTO-FORMAT (FIRST 400 CHARS) ===")
print(formatted[:400])
