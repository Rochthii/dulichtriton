import os
import sys
import json
import urllib.request
import concurrent.futures
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
load_dotenv('.env.local')

or_key = os.getenv("OPENROUTER_API_KEY")

free_models = [
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-nano-9b-v2:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "openai/gpt-oss-20b:free",
    "liquid/lfm-2.5-2.6b:free",
    "cohere/north-mini-code:free",
]

def test_model(model_name):
    url = "https://openrouter.ai/api/v1/chat/completions"
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": "Chào bạn, hãy giới thiệu đặc sản Gà Đốt Tri Tôn trong 1 câu."}],
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
        with urllib.request.urlopen(req, timeout=6) as res:
            data = json.loads(res.read().decode('utf-8'))
            txt = data['choices'][0]['message']['content']
            return model_name, True, txt.strip()
    except Exception as e:
        return model_name, False, str(e)

print("=== CONCURRENT TEST ALL OPENROUTER FREE MODELS ===")
working = []

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(test_model, m): m for m in free_models}
    for future in concurrent.futures.as_completed(futures):
        m, success, msg = future.result()
        if success:
            print(f"[+] {m}: ✅ SUCCESS -> {msg[:60]}...", flush=True)
            working.append(m)
        else:
            print(f"[-] {m}: ❌ {msg[:80]}", flush=True)

print(f"\nTotal Working Free Models on OpenRouter: {len(working)}/{len(free_models)}", flush=True)
print("Working list:", working, flush=True)
