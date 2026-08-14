import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
load_dotenv('.env.local')

or_key = os.getenv("OPENROUTER_API_KEY")

test_models = [
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-nano-9b-v2:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "openai/gpt-oss-20b:free",
    "liquid/lfm-2.5-2.6b:free",
    "cohere/north-mini-code:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "deepseek/deepseek-chat:free",
    "deepseek/deepseek-r1:free"
]

print("=== TESTING OPENROUTER FREE MODELS ===")
working_free_models = []

for m in test_models:
    url = "https://openrouter.ai/api/v1/chat/completions"
    payload = {
        "model": m,
        "messages": [{"role": "user", "content": "Chào bạn, hãy giới thiệu đặc sản Gà Đốt Tri Tôn trong 1 câu ngắn gọn."}],
        "temperature": 0.3
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {or_key}",
            "HTTP-Referer": "https://dulichtriton.vn",
            "X-Title": "Du Lich Tri Ton AI"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as res:
            data = json.loads(res.read().decode('utf-8'))
            txt = data['choices'][0]['message']['content']
            print(f"[+] {m}: ✅ {txt.strip()[:60]}...")
            working_free_models.append(m)
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')[:80]
        print(f"[-] {m}: HTTP {e.code} ({err_msg})")
    except Exception as e:
        print(f"[-] {m}: Error ({e})")

print(f"\nTotal Working Free Models: {len(working_free_models)}")
print("Working Models List:", working_free_models)
