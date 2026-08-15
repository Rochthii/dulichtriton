import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

cafes = [p for p in pois if any(k in p.get('name','').lower() for k in ['coffee', 'cà phê', 'tea', 'trà sữa', 'acoustic', 'chợ đêm', 'quảng trường', 'lang lang', 'chạm', 'ruộng', 'quy', 'ny', 'lang'])]

print(f"Total existing cafe/night POIs: {len(cafes)}")
for c in cafes:
    print(f"  - {c.get('name')} | Open late: {c.get('open_late')} | Commune: {c.get('commune')} | Category: {c.get('category')} | ID: {c.get('id')}")
