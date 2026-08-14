import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv('frontend/.env.local')
k = os.getenv("GEMINI_API_KEY")

for name in ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3-flash-preview"]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{name}:generateContent?key={k}"
    payload = {"contents": [{"parts": [{"text": "Xin chao"}]}]}
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode('utf-8'))
            txt = data['candidates'][0]['content']['parts'][0]['text']
            print(f"[+] {name}: SUCCESS -> {txt.strip()[:40]}")
    except urllib.error.HTTPError as e:
        print(f"[-] {name}: HTTP {e.code} - {e.read().decode('utf-8')[:100]}")
    except Exception as e:
        print(f"[-] {name}: Error - {e}")
