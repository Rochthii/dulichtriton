import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

# Merge duplicate Chùa Xà Tón
keep_svayton = None
dup_svayton = None
for p in pois:
    if p.get('id') == 'chua-xa-ton-chua-svayton':
        keep_svayton = p
    elif p.get('id') == '0c1d5e83-chùa-xà-tón-(wat-xva':
        dup_svayton = p

if keep_svayton and dup_svayton:
    # copy any missing photos or data
    if dup_svayton.get('detailed_story') and not keep_svayton.get('detailed_story'):
        keep_svayton['detailed_story'] = dup_svayton['detailed_story']
    pois = [p for p in pois if p.get('id') != '0c1d5e83-chùa-xà-tón-(wat-xva']
    print("Merged Chùa Xà Tón duplicate.")

# Merge duplicate Núi Dài
keep_nuidai = None
dup_nuidai = None
for p in pois:
    if p.get('id') == 'nui-dai':
        keep_nuidai = p
    elif p.get('id') == 'e5e1c51e-núi-dài-(ngọa-long-s':
        dup_nuidai = p

if keep_nuidai and dup_nuidai:
    if dup_nuidai.get('detailed_story') and not keep_nuidai.get('detailed_story'):
        keep_nuidai['detailed_story'] = dup_nuidai['detailed_story']
    pois = [p for p in pois if p.get('id') != 'e5e1c51e-núi-dài-(ngọa-long-s']
    print("Merged Núi Dài duplicate.")

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print(f"Master dataset cleaned: exactly {len(pois)} unique POIs.")
