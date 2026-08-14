import os
import json
import urllib.request
import sys
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
key = os.environ.get('GEMINI_API_KEY')

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={key}"

payload = {
    "contents": [{
        "parts": [{
            "text": "Tri Tôn An Giang có những điểm tham quan du lịch nào nổi tiếng nhất? Trả lời phong cách Google AI Overview ngắn gọn."
        }]
    }],
    "tools": [{
        "googleSearch": {}
    }]
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        cand = data.get('candidates', [{}])[0]
        text = cand.get('content', {}).get('parts', [{}])[0].get('text', '')
        grounding = cand.get('groundingMetadata', {})
        print("=== RESPONSE FROM GOOGLE GEMINI WITH GOOGLE SEARCH ===")
        print(text)
        print("\n=== GROUNDING SEARCH QUERIES & SOURCES ===")
        queries = grounding.get('webSearchQueries', [])
        print("Web search queries executed by Google:", queries)
        chunks = grounding.get('groundingChunks', [])
        print(f"Grounding chunks found: {len(chunks)}")
        for c in chunks[:3]:
            print(" - Source Title:", c.get('web', {}).get('title'))
            print("   Source URI:", c.get('web', {}).get('uri'))
except Exception as e:
    print("Error:", e)
