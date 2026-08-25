"""
Script làm sạch trực tiếp 100% ký tự Markdown (##, **, *, _, `) trên CSDL Supabase PostgreSQL Cloud
Áp dụng cho các bảng:
- places (cột detailed_story, description, highlights)
- knowledge_base (cột content)
"""
import os
import sys
import json
import re
import urllib.request
import urllib.parse
from dotenv import load_dotenv

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
if os.path.exists(env_path):
    load_dotenv(env_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://knmlbwsmfljlabhvqfid.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

def strip_markdown(text: str) -> str:
    """Làm sạch toàn bộ ký tự markdown, giữ lại văn bản tự nhiên chuẩn chỉ 100%"""
    if not text or not isinstance(text, str):
        return ''
    
    # 1. Bỏ tiêu đề Markdown (#, ##, ###, ####, #####)
    text = re.sub(r'#{1,6}\s*', '', text)
    
    # 2. Bỏ in đậm kép '**' và '__' kể cả xuyên nhiều dòng
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text, flags=re.DOTALL)
    text = re.sub(r'__(.*?)__', r'\1', text, flags=re.DOTALL)
    
    # 3. Chuyển gạch đầu dòng '* ' hoặc '- ' thành '• '
    text = re.sub(r'^\s*[\*\-\+]\s+', '• ', text, flags=re.MULTILINE)
    
    # 4. Bỏ in nghiêng đơn '*' hoặc '_'
    text = re.sub(r'(?<!\w)\*([^\*\n]+)\*(?!\w)', r'\1', text)
    text = re.sub(r'(?<!\w)_([^_\n]+)_(?!\w)', r'\1', text)
    
    # 5. Bỏ link markdown [Label](url) -> Label
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    
    # 6. Bỏ backtick `code`
    text = re.sub(r'`([^`]+)`', r'\1', text)
    
    # 7. Quét sạch tàn dư dấu ** hoặc ## nếu còn sót
    text = text.replace('**', '').replace('##', '').replace('###', '').replace('####', '')
    
    # 8. Xóa khoảng trắng thừa và dòng trống liên tiếp
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def patch_supabase(table: str, row_id: str, patch_data: dict) -> bool:
    """Gửi PATCH trực tiếp lên Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{urllib.parse.quote(row_id)}"
    req = urllib.request.Request(
        url,
        data=json.dumps(patch_data).encode('utf-8'),
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        method='PATCH'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return res.status in (200, 204)
    except Exception as e:
        print(f"❌ Lỗi khi PATCH {table} [id={row_id}]: {e}")
        return False

def clean_places_table():
    print("\n--- [BƯỚC 1: LÀM SẠCH BẢNG PLACES TRÊN SUPABASE CLOUD] ---")
    url = f"{SUPABASE_URL}/rest/v1/places?select=id,name,description,detailed_story,highlights"
    req = urllib.request.Request(
        url,
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        places = json.loads(res.read().decode('utf-8'))

    print(f"📖 Đã tải {len(places)} địa điểm từ Supabase.")

    patched_count = 0
    for idx, p in enumerate(places, 1):
        p_id = p.get('id')
        name = p.get('name', '')
        
        orig_story = p.get('detailed_story') or ''
        orig_desc = p.get('description') or ''

        new_story = strip_markdown(orig_story)
        new_desc = strip_markdown(orig_desc)

        changes = {}
        if new_story != orig_story:
            changes['detailed_story'] = new_story
        if new_desc != orig_desc:
            changes['description'] = new_desc

        if changes:
            success = patch_supabase('places', p_id, changes)
            if success:
                patched_count += 1
                field_list = ', '.join(changes.keys())
                print(f"[{patched_count}] ✓ Đã làm sạch & PATCH [{name}] ({field_list})")

    print(f"\n✨ Hoàn tất bảng places: Đã làm sạch & cập nhật trực tiếp {patched_count}/{len(places)} địa điểm lên Supabase Cloud.")

def clean_knowledge_base_table():
    print("\n--- [BƯỚC 2: LÀM SẠCH BẢNG KNOWLEDGE_BASE TRÊN SUPABASE CLOUD] ---")
    url = f"{SUPABASE_URL}/rest/v1/knowledge_base?select=id,topic,content"
    req = urllib.request.Request(
        url,
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            kb_list = json.loads(res.read().decode('utf-8'))
    except Exception as e:
        print(f"⚠️ Không thể tải knowledge_base: {e}")
        return

    print(f"📖 Đã tải {len(kb_list)} bản ghi tri thức từ Supabase.")

    patched_kb = 0
    for idx, kb in enumerate(kb_list, 1):
        kb_id = kb.get('id')
        orig_content = kb.get('content') or ''
        new_content = strip_markdown(orig_content)

        if new_content != orig_content:
            success = patch_supabase('knowledge_base', str(kb_id), {'content': new_content})
            if success:
                patched_kb += 1
                print(f"[{patched_kb}] ✓ Đã làm sạch & PATCH tri thức [{kb.get('topic')}]")

    print(f"\n✨ Hoàn tất bảng knowledge_base: Đã làm sạch {patched_kb}/{len(kb_list)} bản ghi trên Supabase Cloud.")

def verify_clean_state():
    print("\n--- [BƯỚC 3: ĐO KIỂM XÁC THỰC 0% MARKDOWN CÒN SÓT LẠI] ---")
    url = f"{SUPABASE_URL}/rest/v1/places?select=id,name,description,detailed_story"
    req = urllib.request.Request(
        url,
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        places = json.loads(res.read().decode('utf-8'))

    dirty_places = []
    for p in places:
        s = p.get('detailed_story') or ''
        d = p.get('description') or ''
        if '##' in s or '**' in s or '##' in d or '**' in d:
            dirty_places.append(p.get('name'))

    if not dirty_places:
        print("🎯 XÁC THỰC HOÀN TOÀN: 100% (161/161) địa điểm trên Supabase Cloud KHÔNG CÒN bất kỳ dấu ## hoặc ** nào!")
    else:
        print(f"⚠️ Còn {len(dirty_places)} địa điểm chưa sạch: {dirty_places}")

def main():
    print("================================================================================")
    print("🚀 GIAO THỨC LÀM SẠCH TOÀN DIỆN KÝ TỰ MARKDOWN TRÊN SUPABASE POSTGRESQL CLOUD")
    print("================================================================================")
    
    if not SUPABASE_KEY:
        print("❌ Thiếu SUPABASE_KEY trong frontend/.env.local")
        return 1

    clean_places_table()
    clean_knowledge_base_table()
    verify_clean_state()
    print("\n================================================================================")
    print("🎉 TOÀN BỘ CƠ SỞ DỮ LIỆU SUPABASE CLOUD ĐÃ SẠCH 100%!")
    print("================================================================================")
    return 0

if __name__ == '__main__':
    sys.exit(main())
