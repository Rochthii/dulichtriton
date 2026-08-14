"""
Script: seed_lichtrinh_json.py
Nạp toàn bộ 35 lịch trình từ data/lichtrinh.json vào bảng preset_itineraries.
Convert schema lichtrinh.json → WireDiagram stops schema.
"""
import os, json, sys
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
DB_URL = os.environ['DATABASE_URL']

import psycopg2

# ── Load file ─────────────────────────────────────────────────────────────────
with open('data/lichtrinh.json', encoding='utf-8') as f:
    data = json.load(f)

itineraries = data['itineraries']
print(f"Loaded {len(itineraries)} itineraries from lichtrinh.json")

# ── Category mapping from json fields ─────────────────────────────────────────
CATEGORY_MAP = {
    'classic':          '🔥',
    'comprehensive':    '🗺️',
    'deep_exploration': '🧭',
    'trekking':         '🥾',
    'food':             '🍗',
    'spiritual':        '🙏',
    'history':          '📜',
    'couple':           '💑',
    'family':           '👨‍👩‍👧',
    'half_day':         '🕰️',
    'tiktok':           '📸',
    'nature':           '🌿',
    'budget':           '💰',
    'photography':      '📷',
    'adventure':        '⛰️',
    'wellness':         '🧘',
}

def get_emoji(itinerary: dict) -> str:
    cat = itinerary.get('category', 'classic')
    # Try audiences/experiences for fallback
    audiences = ' '.join(itinerary.get('audiences', []))
    name = itinerary.get('name', '').lower()
    
    if 'sống ảo' in name or 'tiktok' in name or 'check-in' in name:
        return '📸'
    if 'food' in name or 'ẩm thực' in name or 'ăn' in name:
        return '🍗'
    if 'tâm linh' in name or 'chùa' in name or 'spiritual' in cat:
        return '🙏'
    if 'trek' in name or 'leo' in name or 'phượt' in name:
        return '🥾'
    if 'couple' in name or 'đôi' in name or 'lãng mạn' in name:
        return '💑'
    if 'lịch sử' in name or 'tưởng niệm' in name or 'ba chúc' in name:
        return '📜'
    if 'gia đình' in name or 'family' in name:
        return '👨‍👩‍👧'
    if 'nửa ngày' in name or 'half' in name:
        return '🕰️'
    if '3n2d' in name.replace(' ','') or '3 ngày' in name:
        return '🧭'
    if '2n1d' in name.replace(' ','') or '2 ngày' in name:
        return '🗺️'
    return CATEGORY_MAP.get(cat, '🔥')

def convert_stop(raw_stop: dict, day_num: int, order_offset: int) -> dict:
    """Convert lichtrinh.json stop → WireDiagram stop schema"""
    # Parse travel_to_next for minutes
    transport = raw_stop.get('transport_to_next', '')
    travel_min = 0
    travel_km  = 0.0
    
    import re
    m = re.search(r'(\d+)\s*phút', transport)
    if m:
        travel_min = int(m.group(1))
    
    km_m = re.search(r'(\d+(?:\.\d+)?)\s*km', transport)
    if km_m:
        travel_km = float(km_m.group(1))
    
    # Infer category from name/activity
    name  = raw_stop.get('name', '').lower()
    act   = raw_stop.get('activity', '').lower()
    
    if any(k in name+act for k in ['ăn', 'quán', 'lẩu', 'gà đốt', 'bánh', 'bún', 'đu đủ', 'café', 'cafe', 'cà phê', 'trà', 'coffee', 'chợ', 'bia']):
        category = 'food'
    elif any(k in name+act for k in ['chùa', 'tịnh xá', 'đình', 'miếu', 'nhà mồ', 'tưởng niệm']):
        category = 'spiritual'
    elif any(k in name+act for k in ['leo', 'núi', 'đỉnh', 'hang', 'trek', 'vồ']):
        category = 'nature'
    elif any(k in name+act for k in ['lịch sử', 'di tích', 'bảo tàng', 'kháng chiến', 'ba chúc']):
        category = 'history'
    elif any(k in name+act for k in ['check-in', 'chụp ảnh', 'selfie', 'sống ảo', 'hồ', 'cánh đồng', 'hoàng hôn', 'bình minh', 'cổng trời', 'con đường']):
        category = 'check-in'
    elif any(k in name+act for k in ['homestay', 'resort', 'khách sạn', 'phòng']):
        category = 'food'
    else:
        category = 'nature'
    
    # Build tip from notes + activity
    notes    = raw_stop.get('notes', '')
    activity = raw_stop.get('activity', '')
    tip = notes if notes else activity
    if len(tip) > 150:
        tip = tip[:150]
    
    return {
        "order":               raw_stop.get('order', order_offset),
        "name":                raw_stop.get('name', ''),
        "commune":             raw_stop.get('commune', 'Tri Tôn'),
        "category":            category,
        "time_start":          raw_stop.get('time', '07:00'),
        "time_end":            raw_stop.get('time_end', ''),
        "duration_min":        raw_stop.get('duration_minutes', 60),
        "tip":                 tip or activity,
        "travel_to_next_min":  travel_min,
        "travel_to_next_km":   travel_km,
        "cost_vnd":            raw_stop.get('cost_vnd', ''),
        "transport_to_next":   transport,
        "poi_id":              raw_stop.get('poi_id', ''),
        "day":                 day_num,
    }

def flatten_all_stops(itinerary: dict) -> list:
    """Flatten multi-day stops into single list with day markers"""
    all_stops = []
    order = 1
    for day in itinerary.get('days', []):
        day_num = day.get('day', 1)
        for stop in day.get('stops', []):
            converted = convert_stop(stop, day_num, order)
            converted['order'] = order
            all_stops.append(converted)
            order += 1
    return all_stops

# ── Connect and upsert ────────────────────────────────────────────────────────
conn = psycopg2.connect(DB_URL)
conn.autocommit = True
cur = conn.cursor()

success_count = 0
for idx, itin in enumerate(itineraries):
    slug     = itin.get('slug', f"itin-{idx+1:03d}")
    emoji    = get_emoji(itin)
    title    = itin.get('name', 'Lịch Trình Tri Tôn')
    
    # Build tagline from description
    desc = itin.get('description', '')
    tagline = desc[:120] if desc else f"{title} — khám phá vùng đất Bảy Núi"
    
    # for_whom from audiences
    audiences = itin.get('audiences', ['Mọi lứa tuổi'])
    for_whom = ', '.join(audiences)
    
    duration = itin.get('duration', '1 ngày')
    budget   = itin.get('total_cost_estimate_vnd', '')
    
    stops    = flatten_all_stops(itin)
    
    # Tags for search
    tags     = itin.get('tags', [])
    rating   = itin.get('rating', 4.5)
    
    try:
        cur.execute("""
            INSERT INTO preset_itineraries 
              (slug, emoji, title, tagline, for_whom, duration, budget_range, stops, sort_order, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (slug) DO UPDATE SET
              emoji        = EXCLUDED.emoji,
              title        = EXCLUDED.title,
              tagline      = EXCLUDED.tagline,
              for_whom     = EXCLUDED.for_whom,
              duration     = EXCLUDED.duration,
              budget_range = EXCLUDED.budget_range,
              stops        = EXCLUDED.stops,
              sort_order   = EXCLUDED.sort_order
        """, (
            slug, emoji, title, tagline, for_whom, duration, budget,
            json.dumps(stops, ensure_ascii=False),
            idx + 1, True
        ))
        print(f"  [OK] {emoji} {title} ({len(stops)} điểm dừng)")
        success_count += 1
    except Exception as e:
        print(f"  [ERR] {title}: {e}")

conn.close()

print(f"\n✅ DONE: {success_count}/{len(itineraries)} lịch trình nạp thành công!")
print("Verifying count...")

conn2 = psycopg2.connect(DB_URL)
cur2  = conn2.cursor()
cur2.execute("SELECT COUNT(*) FROM preset_itineraries WHERE is_active = true")
count = cur2.fetchone()[0]
conn2.close()
print(f"Total active presets in DB: {count}")
