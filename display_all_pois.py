import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

print(f"{'STT':<4} | {'ID':<30} | {'Tên':<40} | {'Xã':<20} | {'Danh mục':<15} | {'Độ dài bài'}")
print("-" * 125)

for i, p in enumerate(pois):
    pid = p.get('id', '')[:28]
    name = p.get('name', '')[:38]
    commune = (p.get('commune') or '')[:18]
    cat = (p.get('category') or '')[:13]
    story_len = len(p.get('detailed_story') or '')
    print(f"{i+1:<4} | {pid:<30} | {name:<40} | {commune:<20} | {cat:<15} | {story_len}")
