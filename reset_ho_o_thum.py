import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

# Reset ho-o-thum if modified
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

for p in pois:
    if p.get('id') == 'ho-o-thum':
        p['name'] = 'Hồ Ô Thum'
        p['category'] = 'nature'
        p['subcategory'] = 'Hồ nước nhân tạo'
        p['tourism_category'] = 'Cảnh quan thiên nhiên'
        p['description'] = 'Hồ Ô Thum là hồ nước ngọt nhân tạo dưới chân đồi Bảy Núi, thủ phủ ẩm thực Gà Đốt trứ danh tại Xã Ô Lâm, Tri Tôn.'
        break

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print("✅ Reset ho-o-thum successfully!")
