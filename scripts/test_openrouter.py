import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv(dotenv_path='.env.local')

openrouter_key = os.getenv('OPENROUTER_API_KEY')

url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {openrouter_key}",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "HTTP-Referer": "https://dulichtriton.vn",
    "X-Title": "Tri Ton Tourism AI"
}

# Try OpenRouter models without :free suffix if key has credit, or with exact free slugs
models = [
    "deepseek/deepseek-r1:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemini-2.0-flash-lite-001",
    "meta-llama/llama-3.1-8b-instruct",
    "google/gemini-2.0-flash-exp:free"
]

for model in models:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Xin chào"}]
    }
    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"✅ OpenRouter SUCCESS [{model}] Status: {resp.status}")
            data = json.loads(resp.read().decode('utf-8'))
            print(f"   Response: {data['choices'][0]['message']['content'][:60]}...")
            break
    except Exception as e:
        print(f"❌ OpenRouter [{model}] error: {e}")
