import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

food_places = [p for p in pois if p.get('category') in ['food', 'gastronomy', 'đặc sản', 'ăn uống']]
print(f"Tổng số quán ăn / ẩm thực hiện có: {len(food_places)}\n")

for i, p in enumerate(food_places):
    pid = p.get('id')
    name = p.get('name')
    addr = p.get('address')
    commune = p.get('commune')
    print(f"{i+1:02d}. [{pid}] {name} | {commune} | {addr}")
