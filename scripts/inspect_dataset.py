import sys
import json
import os
import unicodedata
from math import radians, cos, sin, asin, sqrt

sys.stdout.reconfigure(encoding='utf-8')

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

print(f"=== TOTAL POIS IN DATASET: {len(pois)} ===")

def norm(s):
    if not s: return ""
    return unicodedata.normalize('NFC', str(s)).lower().strip()

# 1. Check duplicate normalized names
norm_names = {}
for p in pois:
    n = norm(p.get('name', ''))
    norm_names.setdefault(n, []).append(p)

dups = {k: v for k, v in norm_names.items() if len(v) > 1}
print(f"\n1. DUPLICATE NORMALIZED NAMES ({len(dups)}):")
for k, v in dups.items():
    ids = [x.get("id") for x in v]
    print(f"  - '{k}': {len(v)} occurrences -> IDs: {ids}")

# 2. Check Geographic Overlaps (< 120 meters)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000 # meters
    dLat = radians(lat2 - lat1)
    dLon = radians(lon2 - lon1)
    a = sin(dLat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dLon/2)**2
    return 2 * R * asin(sqrt(a))

close_pairs = []
for i in range(len(pois)):
    for j in range(i+1, len(pois)):
        p1, p2 = pois[i], pois[j]
        lat1, lon1 = p1.get('latitude'), p1.get('longitude')
        lat2, lon2 = p2.get('latitude'), p2.get('longitude')
        if lat1 and lon1 and lat2 and lon2:
            try:
                dist = haversine(float(lat1), float(lon1), float(lat2), float(lon2))
                if dist < 120:
                    close_pairs.append((p1.get('name'), p2.get('name'), round(dist, 1), p1.get('category'), p2.get('category'), p1.get('id'), p2.get('id')))
            except:
                pass

print(f"\n2. GEOGRAPHIC OVERLAPS < 120m ({len(close_pairs)} pairs):")
for p in close_pairs:
    print(f"  - [{p[2]}m] '{p[0]}' ({p[3]}) <---> '{p[1]}' ({p[4]}) [IDs: {p[5]} / {p[6]}]")

# 3. Check Misclassified / Non-Tourism POIs
junk_keywords = [
    '70k', '200k', 'nhà nghi', 'nha nhgi', 'mầm non', 'trường tiểu học',
    'trung tâm y tế', 'ngã 3', 'ngã ba quẹo', 'tiệm sửa xe', 'uỷ ban'
]
non_tourism = []
for p in pois:
    n = norm(p.get('name', ''))
    if any(k in n for k in junk_keywords):
        non_tourism.append(p)

print(f"\n3. NON-TOURISM / JUNK POIs DETECTED ({len(non_tourism)}):")
for p in non_tourism:
    print(f"  - '{p.get('name')}' | Cat: {p.get('category')} | Commune: {p.get('commune')} | ID: {p.get('id')}")

# 4. Check foreign / spam snippets in description or detailed_story
spam_signals = [
    'bóng đá', 'chứng khoán', 'bta41', 'nagoya', 'ilovepdf', 'sài gòn',
    'new york', 'mlb.com', 'microsoft', 'củ nghệ', 'con definition'
]
found_spam = []
for p in pois:
    desc = norm(p.get('description', '') + ' ' + p.get('detailed_story', ''))
    for s in spam_signals:
        if s in desc:
            found_spam.append((p.get('name'), s, p.get('id')))
            break

print(f"\n4. SPAM / IRRELEVANT TEXT DETECTED ({len(found_spam)}):")
for p in found_spam:
    print(f"  - '{p[0]}' (ID: {p[2]}): contains spam keyword '{p[1]}'")
