import sys
import json
import re
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

def clean_text(text: str) -> str:
    if not text or not isinstance(text, str):
        return ""
    # Strip prompt boilerplate
    t = re.sub(r'^Dưới đây là bản biên tập.*?:\s*', '', text, flags=re.IGNORECASE | re.DOTALL)
    t = re.sub(r'^Thông [Tt]in [Tt]hực [Tt]ế [Vv]ề.*?:\s*', '', t, flags=re.IGNORECASE | re.DOTALL)
    t = re.sub(r'^Khám phá.*?–\s*', '', t, flags=re.IGNORECASE)
    # Strip markdown headings
    t = re.sub(r'#{1,6}\s*', '', t)
    # Strip markdown formatting symbols: ***, **, *, __, _, ~~
    t = re.sub(r'(\*\*\*|\*\*|\*|___|__|_|~~)', '', t)
    # Strip bullet point markers
    t = re.sub(r'^\s*[-*+•]\s+', '', t, flags=re.MULTILINE)
    # Strip blockquotes
    t = re.sub(r'^\s*>\s*', '', t, flags=re.MULTILINE)
    # Strip multiple punctuation: !!!, ???
    t = re.sub(r'!{2,}', '.', t)
    t = re.sub(r'\?{2,}', '?', t)
    # Strip HTML tags
    t = re.sub(r'<[^>]*>?', '', t)
    # Clean redundant geographic naming
    t = re.sub(r'Thị trấn Tri Tôn,\s*Tri Tôn,\s*An Giang', 'Thị trấn Tri Tôn, An Giang', t, flags=re.IGNORECASE)
    t = re.sub(r'Xã ([^,]+),\s*Tri Tôn,\s*An Giang', r'Xã \1, An Giang', t, flags=re.IGNORECASE)
    t = re.sub(r'huyện Tri Tôn,\s*Tri Tôn', 'Tri Tôn', t, flags=re.IGNORECASE)
    # Normalize spaces
    t = re.sub(r'[ \t]+', ' ', t)
    t = re.sub(r'\n{3,}', '\n\n', t)
    return t.strip()

# 1. Update local files
with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

cleaned_count = 0
for p in pois:
    orig_desc = p.get('description', '')
    cleaned_desc = clean_text(orig_desc)
    if cleaned_desc != orig_desc:
        p['description'] = cleaned_desc
        cleaned_count += 1

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print(f"🧹 Đã làm sạch ký tự lạ cho {cleaned_count} địa điểm trong JSON Master")

# 2. Update Supabase database
env_path = 'E:/Projects/Project_ca_nhan/dulichtriton/frontend/.env.local'
supabase_url = None
service_key = None

with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            supabase_url = line.split('=', 1)[1].strip().strip('"').strip("'")
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            service_key = line.split('=', 1)[1].strip().strip('"').strip("'")

# Fetch all places
req = urllib.request.Request(
    f"{supabase_url}/rest/v1/places?select=id,description",
    headers={
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
    }
)

with urllib.request.urlopen(req) as resp:
    db_places = json.loads(resp.read().decode('utf-8'))

supabase_cleaned = 0
for p in db_places:
    pid = p.get('id')
    orig_desc = p.get('description') or ''
    cleaned = clean_text(orig_desc)
    if cleaned != orig_desc and len(cleaned) > 10:
        payload = json.dumps({
            "description": cleaned,
            "updated_at": "2026-08-15T17:33:00Z"
        }).encode('utf-8')

        encoded_id = urllib.parse.quote(str(pid))
        patch_req = urllib.request.Request(
            f"{supabase_url}/rest/v1/places?id=eq.{encoded_id}",
            data=payload,
            headers={
                "apikey": service_key,
                "Authorization": f"Bearer {service_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            method='PATCH'
        )
        try:
            with urllib.request.urlopen(patch_req) as res:
                supabase_cleaned += 1
        except Exception as e:
            print(f"⚠️ Error cleaning Supabase description {pid}: {e}")

print(f"🎉 Hoàn tất làm sạch ký tự đặc biệt trên Supabase! Đã cập nhật {supabase_cleaned} bản ghi.")
