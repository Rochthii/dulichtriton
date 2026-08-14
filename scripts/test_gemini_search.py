import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv('frontend/.env.local')
key = os.environ.get('GEMINI_API_KEY')

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"

payload = {
    "contents": [{
        "parts": [{
            "text": "tri tôn có gì chơi"
        }]
    }],
    "tools": [{
        "google_search": {}
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
        print("=== RESPONSE TEXT FROM GOOGLE SEARCH GROUNDING ===")
        print(text)
        print("\n=== GROUNDING METADATA FROM GOOGLE ===")
        print(json.dumps(grounding, indent=2, ensure_ascii=False)[:800])
except Exception as e:
    print("Error with google_search:", e)
    # try googleSearch
    payload["tools"] = [{"googleSearch": {}}]
    req2 = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req2) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            cand = data.get('candidates', [{}])[0]
            text = cand.get('content', {}).get('parts', [{}])[0].get('text', '')
            print("=== SUCCESS WITH googleSearch ===")
            print(text)
    except Exception as e2:
        print("Error with googleSearch:", e2)
