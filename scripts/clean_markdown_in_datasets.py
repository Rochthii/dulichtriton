"""
Script làm sạch toàn bộ ký tự Markdown (##, **, *, _, `, []) trong cột Sự Tích, Mô Tả, Mẹo Thực Địa
Áp dụng cho:
1. frontend/src/data/triton_pois_full.json
2. data/tri_ton_master_cleaned.csv
3. Tự động đồng bộ lên Supabase Cloud qua Smart Delta Sync
"""
import json
import csv
import re
import os
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def strip_markdown(text: str) -> str:
    """Làm sạch toàn bộ ký tự markdown, giữ lại văn bản tự nhiên chuẩn chỉ"""
    if not text or not isinstance(text, str):
        return ''
    
    # 1. Bỏ tiêu đề Markdown (#, ##, ###, ####)
    text = re.sub(r'^(?:#{1,6}\s+)', '', text, flags=re.MULTILINE)
    
    # 2. Bỏ in đậm kép '**' và '__'
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'__(.*?)__', r'\1', text)
    
    # 3. Chuyển gạch đầu dòng '* ' hoặc '- ' thành '• '
    text = re.sub(r'^\s*[\*\-\+]\s+', '• ', text, flags=re.MULTILINE)
    
    # 4. Bỏ in nghiêng đơn '*' hoặc '_'
    text = re.sub(r'(?<!\w)\*([^\*\n]+)\*(?!\w)', r'\1', text)
    text = re.sub(r'(?<!\w)_([^_\n]+)_(?!\w)', r'\1', text)
    
    # 5. Bỏ link markdown [Label](url) -> Label
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    
    # 6. Bỏ backtick `code`
    text = re.sub(r'`([^`]+)`', r'\1', text)
    
    # 7. Xóa khoảng trắng thừa và dòng trống liên tiếp
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def clean_json_pois():
    json_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data', 'triton_pois_full.json')
    if not os.path.exists(json_path):
        print(f"⚠️ Không tìm thấy file: {json_path}")
        return 0

    with open(json_path, 'r', encoding='utf-8') as f:
        places = json.load(f)

    cleaned_count = 0
    for p in places:
        orig_story = p.get('detailed_story') or ''
        orig_desc = p.get('description') or ''
        orig_tips = p.get('field_tips') or ''

        new_story = strip_markdown(orig_story)
        new_desc = strip_markdown(orig_desc)
        new_tips = strip_markdown(orig_tips)

        if new_story != orig_story or new_desc != orig_desc or new_tips != orig_tips:
            p['detailed_story'] = new_story
            p['description'] = new_desc
            p['field_tips'] = new_tips
            cleaned_count += 1

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(places, f, ensure_ascii=False, indent=2)

    print(f"✓ Đã làm sạch Markdown cho {cleaned_count}/{len(places)} địa điểm trong triton_pois_full.json")
    return cleaned_count

def clean_csv_master():
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'tri_ton_master_cleaned.csv')
    if not os.path.exists(csv_path):
        print(f"⚠️ Không tìm thấy file: {csv_path}")
        return 0

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames

    clean_fieldnames = [f for f in fieldnames if f is not None]
    cleaned_count = 0
    cleaned_rows = []
    for r in rows:
        cleaned_r = {k: r.get(k, '') for k in clean_fieldnames}
        for col in ['detailed_story', 'description', 'field_tips']:
            if col in cleaned_r and cleaned_r[col]:
                orig = cleaned_r[col]
                cleaned = strip_markdown(orig)
                if cleaned != orig:
                    cleaned_r[col] = cleaned
                    cleaned_count += 1
        cleaned_rows.append(cleaned_r)

    with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=clean_fieldnames)
        writer.writeheader()
        writer.writerows(cleaned_rows)

    print(f"✓ Đã làm sạch Markdown cho {len(rows)} bản ghi trong tri_ton_master_cleaned.csv")
    return cleaned_count

def main():
    print("================================================================================")
    print("🧹 TIẾN TRÌNH LÀM SẠCH KÝ TỰ MARKDOWN (##, **, *, `) TRONG CƠ SỞ DỮ LIỆU")
    print("================================================================================")
    clean_json_pois()
    clean_csv_master()
    print("================================================================================")

if __name__ == '__main__':
    main()
