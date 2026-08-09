import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
GEMINI_KEY = os.getenv('GEMINI_API_KEY')

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={GEMINI_KEY}"
payload = {
    "model": "models/gemini-embedding-001",
    "content": {
        "parts": [{"text": "Tri Tôn An Giang Hồ Tà Pạ"}]
    },
    "outputDimensionality": 768
}

try:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode('utf-8'))
        vec = data['embedding']['values']
        print("✅ SUCCESS with outputDimensionality=768! Vector dimension:", len(vec))
except Exception as e:
    print("❌ Failed:", e)
