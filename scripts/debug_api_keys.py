import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv(dotenv_path='.env.local')

gemini_key = os.getenv('GEMINI_API_KEY')
gemini_key_2 = os.getenv('GEMINI_API_KEY_2')
groq_key = os.getenv('GROQ_API_KEY')
openrouter_key = os.getenv('OPENROUTER_API_KEY')

print(f"Gemini Key 1: {gemini_key[:10]}...")
print(f"Gemini Key 2: {gemini_key_2[:10]}...")
print(f"Groq Key: {groq_key[:10]}...")
print(f"OpenRouter Key: {openrouter_key[:10]}...")

# 1. Test OpenRouter with User-Agent and valid free models
url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {openrouter_key}",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "HTTP-Referer": "https://dulichtriton.vn",
    "X-Title": "Tri Ton Tourism AI"
}

openrouter_models = [
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "google/gemini-2.0-flash-lite-preview-02-05:free",
    "qwen/qwen-2.5-7b-instruct:free"
]

for model in openrouter_models:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Xin chào"}]
    }
    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"OpenRouter [{model}] Status: {resp.status}")
            data = json.loads(resp.read().decode('utf-8'))
            content = data['choices'][0]['message']['content']
            print(f"   Response: {content[:60]}...")
            break
    except Exception as e:
        print(f"OpenRouter [{model}] error: {e}")

# 2. Test Groq with User-Agent
groq_url = "https://api.groq.com/openai/v1/chat/completions"
groq_headers = {
    "Authorization": f"Bearer {groq_key}",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}
groq_payload = {
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "Xin chào"}]
}

try:
    req = urllib.request.Request(groq_url, data=json.dumps(groq_payload).encode('utf-8'), headers=groq_headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        print(f"Groq Status: {resp.status}")
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Groq Response: {data['choices'][0]['message']['content'][:60]}...")
except Exception as e:
    print(f"Groq error: {e}")
