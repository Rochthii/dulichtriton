import os
import json
import urllib.request
import sys
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')

keys = [
    ('KEY_1', os.environ.get('GEMINI_API_KEY')),
    ('KEY_2', os.environ.get('GEMINI_API_KEY_2')),
    ('KEY_3', os.environ.get('GEMINI_API_KEY_3')),
    ('KEY_4', os.environ.get('GEMINI_API_KEY_4')),
]

for label, key in keys:
    if not key:
        continue
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={key}"
    payload = {
        "contents": [{
            "parts": [{
                "text": "Tri Tôn An Giang có gì chơi? Trả lời ngắn 2 câu."
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
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            cand = data.get('candidates', [{}])[0]
            text = cand.get('content', {}).get('parts', [{}])[0].get('text', '')
            grounding = cand.get('groundingMetadata', {})
            print(f"[SUCCESS] {label}:")
            print("Response:", text[:300])
            queries = grounding.get('webSearchQueries', [])
            print("Google Search Queries:", queries)
            chunks = grounding.get('groundingChunks', [])
            print(f"Web Sources ({len(chunks)}):")
            for c in chunks[:2]:
                print(" -", c.get('web', {}).get('title'), "->", c.get('web', {}).get('uri'))
            print("-" * 50)
    except Exception as e:
        print(f"[FAIL] {label}: {e}")
