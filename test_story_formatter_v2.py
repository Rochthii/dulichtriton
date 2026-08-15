import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

def format_detailed_story(text: str) -> str:
    if not text or not isinstance(text, str):
        return ""

    # Replace forbidden terms
    text = text.replace("gà nướng đất", "gà đốt đất")
    text = text.replace("gà nướng", "gà đốt")
    text = text.replace("Huyện Tri Tôn", "Tri Tôn")

    # If text is already nicely formatted with newlines and headings, return cleaned
    # Pattern to find numbered section titles like "1. Vị Trí & Đặc Điểm Địa Lý", "2. Cảnh Quan Sinh Thái & Đời Sống Sơn Dân"
    # Even if glued to next word like "1. Vị Trí & Đặc Điểm Địa LýVị trí hành chính:"
    
    # 1. Break before numbered headings 1. to 9.
    # We look for patterns like: (\d+\.\s+[^:\n]+?)(?=[A-ZÀ-Ỵ][a-zà-ỹ\s]+:|$)
    def heading_sub(match):
        full = match.group(0)
        return f"\n\n### {full.strip()}\n\n"

    # Split by standard section headers 1. 2. 3. 4. 5. 6. 7. 8. 9.
    sections = re.split(r'(?=(\b[1-9]\.\s+[A-ZÀ-Ỵ]))', text)
    
    formatted_parts = []
    for sec in sections:
        sec = sec.strip()
        if not sec:
            continue
        
        # Check if starts with number
        m = re.match(r'^([1-9]\.\s+[^:\.\n]+?)(?:([A-ZÀ-Ỵ][a-zà-ỹ\s&]+:|\.\s+|$)(.*))?$', sec, re.DOTALL)
        if m:
            heading = m.group(1).strip()
            first_label = m.group(2) or ""
            rest = m.group(3) or ""
            
            content = ""
            if first_label:
                content += f"\n- **{first_label.strip()}** "
            if rest:
                content += rest.strip()
            
            # Now format sub-labels inside content like "Quy mô:", "Lưu ý phân biệt:", "Phương tiện:"
            # Any word ending with colon preceded by space or period
            content = re.sub(r'([A-ZÀ-Ỵ][^:\n\.\?]{2,30}:)', r'\n- **\1**', content)
            
            formatted_parts.append(f"### {heading}\n{content.strip()}")
        else:
            # Intro paragraph
            # Split sentences if intro is long
            formatted_parts.append(sec)

    result = "\n\n".join(formatted_parts)
    # Clean up double bolding or double dashes
    result = re.sub(r'\n-\s*\n-\s*', '\n- ', result)
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

nui_dai = next(x for x in pois if x.get('slug') == 'nui-dai')
res = format_detailed_story(nui_dai.get('detailed_story'))
print("=== BEAUTIFIED NUI-DAI STORY ===")
print(res)
