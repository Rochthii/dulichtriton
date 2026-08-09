"""
Script Seed & Embed 148+ Golden Q&A Dataset sang Supabase Table `golden_answers`
Model Embedding: gemini-embedding-001 (768 dimensions)
"""
import os
import sys
import json
import unicodedata
import urllib.request
import urllib.parse
from dotenv import load_dotenv

# Fix Windows console UTF-8 output encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load env variables from root .env and frontend/.env.local
root_env = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(root_env)
env_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
load_dotenv(env_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://knmlbwsmfljlabhvqfid.supabase.co')
# Ưu tiên Service Role Key đẻ có quyền ghi trực tiếp REST API không bị cấm 404/401 RLS
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
# Danh sách các Gemini API Keys để tự động xoay vòng khi bị Limit Quota
GEMINI_KEYS = [k for k in [
    os.getenv('GEMINI_API_KEY'),
    os.getenv('GEMINI_API_KEY_2'),
    os.getenv('GEMINI_API_KEY_3'),
    os.getenv('GEMINI_API_KEY_4'),
] if k]

import time

def get_embedding(text: str) -> list[float]:
    """Tạo Vector Embedding 768 chiều với cơ chế tự động xoay vòng API Key khi chạm limit"""
    for key in GEMINI_KEYS:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={key}"
            payload = {
                "model": "models/gemini-embedding-001",
                "content": {
                    "parts": [{"text": text}]
                },
                "outputDimensionality": 768
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=10) as res:
                data = json.loads(res.read().decode('utf-8'))
                vector = data.get('embedding', {}).get('values')
                if vector:
                    return vector
        except Exception as e:
            if '429' in str(e):
                time.sleep(2)
            continue
    raise RuntimeError("Tất cả Gemini API Keys đều bị hạn chế Quota hoặc lỗi kết nối!")

def classify_intent(q: str, id_str: str) -> str:
    """Tự động phân loại intent từ ID và câu hỏi"""
    q_lower = q.toLowerCase() if hasattr(q, 'toLowerCase') else q.lower()
    if 'ăn' in q_lower or 'quán' in q_lower or 'đặc sản' in q_lower or 'bún' in q_lower or 'gà' in q_lower or 'bò' in q_lower or 'bánh' in q_lower:
        return 'food'
    if 'lịch trình' in q_lower or 'tour' in q_lower or 'ngày' in q_lower or 'đâu' in q_lower:
        return 'itinerary'
    if 'chùa' in q_lower or 'lễ hội' in q_lower or 'văn hóa' in q_lower or 'khmer' in q_lower or 'lịch sử' in q_lower:
        return 'culture'
    if 'tránh' in q_lower or 'không nên' in q_lower or 'cảnh báo' in q_lower or 'an toàn' in q_lower:
        return 'safety'
    return 'place'

def upsert_golden_answer(record: dict):
    """Upsert một bản ghi vào bảng golden_answers trên Supabase qua PostgREST Header"""
    url = f"{SUPABASE_URL}/rest/v1/golden_answers"
    req = urllib.request.Request(
        url,
        data=json.dumps(record).encode('utf-8'),
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as res:
            return res.status
    except urllib.error.HTTPError as err:
        err_msg = err.read().decode('utf-8')
        print(f"      [Supabase HTTP {err.code}] {err_msg}")
        return err.code

def main():
    jsonl_path = os.path.join(os.path.dirname(__file__), '..', 'tests', 'eval', 'golden_answers.jsonl')
    print(f"🔄 Đang đọc file dataset: {jsonl_path}")
    
    with open(jsonl_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    print(f"📊 Tổng số câu hỏi golden trong dataset: {len(lines)}")
    success_count = 0
    
    for idx, line in enumerate(lines, 1):
        line = line.strip()
        if not line:
            continue
        
        item = json.loads(line)
        qid = item['id']
        question = unicodedata.normalize('NFC', item['q'])
        answer_dict = item['a']
        fmt = answer_dict.get('format', 'json')
        intent = classify_intent(question, qid)
        
        print(f"[{idx}/{len(lines)}] ⚙️ Processing {qid}: '{question[:30]}...'")
        
        try:
            vector = get_embedding(question)
            record = {
                "id": qid,
                "intent": intent,
                "question": question,
                "answer_json": answer_dict,
                "format": fmt,
                "embedding": vector
            }
            status = upsert_golden_answer(record)
            if status in (200, 201):
                success_count += 1
                print(f"   ✅ Upsert thành công {qid}")
            else:
                print(f"   ⚠️ Upsert status: {status}")
        except Exception as e:
            print(f"   ❌ Lỗi khi xử lý {qid}: {str(e)}")
            
    print(f"\n🎉 Hoàn thành seed {success_count}/{len(lines)} bản ghi vào Supabase table `golden_answers`!")

if __name__ == '__main__':
    main()
