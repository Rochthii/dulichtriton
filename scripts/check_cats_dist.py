import json
from collections import Counter

with open("data/triton_pois_full.json", "r", encoding="utf-8") as f:
    full_pois = json.load(f)

cats = Counter(p.get("category") for p in full_pois)
subcats = Counter(p.get("subcategory") for p in full_pois)

print("Categories distribution:")
for k, v in cats.items():
    print(f"  {k}: {v}")

print("\nSubcategories distribution:")
for k, v in subcats.items():
    print(f"  {k}: {v}")
