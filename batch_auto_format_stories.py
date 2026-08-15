import sys
import json
import re
import urllib.request
import os

sys.stdout.reconfigure(encoding='utf-8')

def clean_and_format_story(text: str) -> str:
    if not text or not isinstance(text, str) or len(text.strip()) < 50:
        return text or ""

    # Replace forbidden terms
    text = text.replace("gà nướng đất", "gà đốt đất")
    text = text.replace("Gà nướng đất", "Gà đốt đất")
    text = text.replace("gà nướng Ô Thum", "gà đốt Ô Thum")
    text = text.replace("gà nướng", "gà đốt")
    text = text.replace("Huyện Tri Tôn", "Tri Tôn")

    # Step 1: Fix glued numbered sections: e.g. "1. Vị Trí & Đặc Điểm Địa LýVị trí hành chính:"
    # Regex finds numbers 1. to 9. followed by a section title
    # Pattern: (?:\s+|^)([1-9]\.\s+[A-ZÀ-Ỵ][^\n\.:]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ\s&]+:|\.\s+[A-ZÀ-Ỵ]|\n|$)
    # Let's use a safe pattern replacement:
    
    # Common section titles in Tri Ton dataset
    sec_patterns = [
        r'(1\.\s+Vị Trí[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(2\.\s+Cảnh Quan[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(3\.\s+Di Tích[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(4\.\s+Hướng Dẫn[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(5\.\s+Lưu Ý[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(1\.\s+Lịch Sử[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(2\.\s+Kiến Trúc[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(3\.\s+Trải Nghiệm[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(4\.\s+Ẩm Thực[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(1\.\s+Nguồn Gốc[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(2\.\s+Hương Vị[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(3\.\s+Bí Quyết[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)',
        r'(\b[1-9]\.\s+[A-ZÀ-Ỵ][A-Za-zÀ-ỹ0-9\s,&/–\-]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ\s&]+:|\n|$)'
    ]
    
    # Split text into sections by detecting numbers like '1. ', '2. ', '3. ', '4. ', '5. '
    # We replace any number sequence at boundary
    text = re.sub(r'(\s+|^)([1-9]\.\s+[A-ZÀ-Ỵ][^\n:–\-]{3,40}?)(?=[A-ZÀ-Ỵ][a-zà-ỹ]+:|\n|$)', r'\n\n### \2\n\n', text)

    # Step 2: Format labels ending with colons into bullet points with bold tags: - **Label:**
    # e.g. "Vị trí hành chính: ...", "Quy mô: ...", "Lưu ý phân biệt: ..."
    # Match any capitalized phrase (2-35 chars) followed by colon
    text = re.sub(r'(?<!\n- \*\*)(?<!### )(?<=\s|\.|\n)([A-ZÀ-Ỵ][A-Za-zÀ-ỹ0-9\s&/\(\)–\-]{2,35}:)', r'\n\n- **\1** ', text)

    # Step 3: Handle sub-items with bullets like 'Núi Dài Lớn (Ngọa Long Sơn):', 'Núi Dài Nhỏ:'
    text = re.sub(r'(\n-\s*\*\*[^\*]+:\*\*)\s*(\n-\s*\*\*)', r'\1\2', text)
    
    # Step 4: Clean up double bolding
    text = re.sub(r'\*\*\*\*+', '', text)
    text = re.sub(r'\*\*\s*:\s*\*\*', ':**', text)
    text = re.sub(r':\*\*\s*:\*\*', ':**', text)

    # Step 5: Clean multiple newlines and spaces
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'###\s+###\s+', '### ', text)
    
    # Fix intro paragraph if attached to title
    # If text starts with Title, separate it nicely
    lines = text.split('\n\n')
    cleaned_lines = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        cleaned_lines.append(line)

    return "\n\n".join(cleaned_lines).strip()

# Apply to triton_pois_full.json
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

updated_count = 0
for p in pois:
    story = p.get('detailed_story')
    if story and len(story) > 50:
        new_story = clean_and_format_story(story)
        if new_story != story:
            p['detailed_story'] = new_story
            updated_count += 1

print(f"Auto-formatted {updated_count} POI detailed stories!")

# Save to local files
with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print("Saved cleanly to data/ and frontend/src/data/!")

# Show Nui Dai sample
nui_dai = next(x for x in pois if x.get('id') == 'nui-dai' or x.get('slug') == 'nui-dai')
print("\n=== SAMPLE FORMATTED NUI DAI STORY ===")
print(nui_dai.get('detailed_story'))
