import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

print(f"Total POIs in JSON: {len(pois)}")

all_keys = set()
key_counts = {}
sample_values = {}

for p in pois:
    for k, v in p.items():
        all_keys.add(k)
        if v is not None and v != "" and v != [] and v != {}:
            key_counts[k] = key_counts.get(k, 0) + 1
            if k not in sample_values:
                sample_values[k] = v

print("\n--- ALL KEYS & NON-EMPTY COUNTS ---")
for k in sorted(all_keys):
    cnt = key_counts.get(k, 0)
    val = sample_values.get(k)
    val_str = str(val)[:120] if val is not None else "None"
    print(f"Key: {k:<30} | Non-empty: {cnt}/{len(pois)} | Sample: {val_str}")
