import psycopg2
import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('.env.local')
load_dotenv('.env')

DB_URL = os.getenv('DATABASE_URL')
GEMINI_KEY = os.getenv('GEMINI_API_KEY')

def get_embedding(text: str):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={GEMINI_KEY}"
    payload = {
        "model": "models/gemini-embedding-001",
        "content": {"parts": [{"text": text}]},
        "outputDimensionality": 768
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode('utf-8'))['embedding']['values']

def call_gemini_3(prompt: str):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={GEMINI_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3}
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=20) as res:
        data = json.loads(res.read().decode('utf-8'))
        return data['candidates'][0]['content']['parts'][0]['text']

def test_rag_query(query: str):
    print(f"\n========================================================")
    print(f"❓ CÂU HỎI USER: '{query}'")
    print(f"========================================================")
    
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    emb = get_embedding(query)
    
    # 1. RAG KB Retrieval
    cur.execute("SELECT id, title, category, summary, content, similarity FROM match_kb(%s::vector, 0.40, 3);", (emb,))
    kb_results = cur.fetchall()
    
    # 2. RAG Places Retrieval
    cur.execute("SELECT id, name, commune, category, rating, description, similarity FROM match_places(%s::vector, 0.40, 6);", (emb,))
    places_results = cur.fetchall()
    
    cur.close()
    conn.close()
    
    print("\n📚 RAG RETRIEVAL TỪ KHO TRI THỨC (KB):")
    for r in kb_results:
        print(f"  - [{r[5]:.2f}] {r[1]} ({r[2]})")
        
    print("\n📍 RAG RETRIEVAL TỪ BẢNG PLACES (174 POIs):")
    for r in places_results:
        print(f"  - [{r[6]:.2f}] {r[1]} ({r[2]} - {r[3]})")
        
    # Build Prompt for LLM
    context_text = "### KHO TRI THỨC & CẨM NANG TRI TÔN:\n"
    for r in kb_results:
        context_text += f"- {r[1]}: {r[3]}\n"
        
    context_text += "\n### CÁC ĐỊA ĐIỂM TIÊU BIỂU (TỪ DATABASE 174 POIS TRI TÔN):\n"
    for r in places_results:
        context_text += f"- {r[1]} (Tại {r[2]}): {r[5]} (Đánh giá: {r[4]} sao)\n"
        
    system_instruction = (
        "Bạn là Trợ lý AI Du Lịch Tri Tôn chuyên nghiệp. Hãy trả lời câu hỏi của du khách một cách hấp dẫn, giàu cảm xúc, có cấu trúc rõ ràng "
        "dựa trên dữ liệu thực tế được cung cấp. Phân nhóm rõ ràng (Thắng cảnh thiên nhiên, Văn hóa - Chùa chiền Khmer, Ẩm thực đặc sản). "
        "Xưng 'Tôi' và gọi du khách là 'Bạn'. KHÔNG dùng từ 'Huyện Tri Tôn', hãy dùng Xã/Thị trấn cụ thể."
    )
    
    full_prompt = f"{system_instruction}\n\n{context_text}\n\nCâu hỏi: {query}\nTrả lời:"
    
    answer = call_gemini_3(full_prompt)
    print(f"\n🤖 PHẢN HỒI CỦA RAG AI:\n")
    print(answer)

if __name__ == "__main__":
    test_rag_query("Tri Tôn có gì chơi?")
    test_rag_query("Du lịch đâu Tri Tôn 1 ngày?")
