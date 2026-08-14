import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
k = os.getenv("GEMINI_API_KEY")

for name in ["gemini-3-flash-preview", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-latest"]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{name}:generateContent?key={k}"
    payload = {"contents": [{"parts": [{"text": "Chào bạn, hãy giới thiệu Tri Tôn trong 1 câu."}]}]}
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=12) as res:
            data = json.loads(res.read().decode('utf-8'))
            txt = data['candidates'][0]['content']['parts'][0]['text']
            print(f"[+] {name}: ✅ {txt.strip()}")
    except Exception as e:
        print(f"[-] {name}: ❌ {e}")
