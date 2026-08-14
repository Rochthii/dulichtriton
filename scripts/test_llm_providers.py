import os
import json
import urllib.request
import sys
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')

openrouter_key = os.environ.get('OPENROUTER_API_KEY')
groq_key = os.environ.get('GROQ_API_KEY')

print(f"OpenRouter key present: {bool(openrouter_key)}")
print(f"Groq key present: {bool(groq_key)}")

# Test OpenRouter
if openrouter_key:
    url = "https://openrouter.ai/api/v1/chat/completions"
    payload = {
        "model": "nvidia/nemotron-3-nano-30b-a3b:free",
        "messages": [
            {"role": "system", "content": "Bạn là trợ lý du lịch Tri Tôn. Trả lời phong cách Google AI Overview."},
            {"role": "user", "content": "Tri Tôn có gì chơi?"}
        ]
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {openrouter_key}',
            'HTTP-Referer': 'https://dulichtriton.vn',
            'X-Title': 'Du Lich Tri Ton AI'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("\n[SUCCESS] OpenRouter Response:")
            print(data['choices'][0]['message']['content'])
    except Exception as e:
        print("\n[FAIL] OpenRouter:", e)

# Test Groq
if groq_key:
    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "Bạn là trợ lý du lịch Tri Tôn. Trả lời phong cách Google AI Overview."},
            {"role": "user", "content": "Tri Tôn có gì chơi?"}
        ]
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {groq_key}'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("\n[SUCCESS] Groq Response:")
            print(data['choices'][0]['message']['content'])
    except Exception as e:
        print("\n[FAIL] Groq:", e)
