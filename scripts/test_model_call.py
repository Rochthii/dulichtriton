import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv('frontend/.env.local')
key = os.environ.get('GEMINI_API_KEY')

models_to_test = [
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
]

for m in models_to_test:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={key}"
    payload = {
        "contents": [{
            "parts": [{
                "text": "Tri Tôn An Giang có gì đặc sắc? Trả lời ngắn 2 câu."
            }]
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
            txt = data['candidates'][0]['content']['parts'][0]['text']
            print(f"[OK] Model: {m}")
            print(f"     Response: {txt.strip()}\n")
    except Exception as e:
        print(f"[FAIL] Model {m}: {e}")
