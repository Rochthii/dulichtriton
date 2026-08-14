import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
load_dotenv('.env.local')

keys = {
    "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY"),
    "GEMINI_API_KEY_2": os.getenv("GEMINI_API_KEY_2"),
    "GEMINI_API_KEY_3": os.getenv("GEMINI_API_KEY_3"),
    "GEMINI_API_KEY_4": os.getenv("GEMINI_API_KEY_4"),
    "GROQ_API_KEY": os.getenv("GROQ_API_KEY"),
    "OPENROUTER_API_KEY": os.getenv("OPENROUTER_API_KEY"),
}

for name, k in keys.items():
    if not k:
        print(f"[-] {name}: Not found")
        continue
    
    if "GEMINI" in name:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={k}"
            req = urllib.request.Request(url, data=json.dumps({"contents":[{"parts":[{"text":"Hi"}]}]}).encode('utf-8'), headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=5) as res:
                print(f"[+] {name}: ✅ Working (Gemini 2.0 Flash)")
        except Exception as e:
            print(f"[!] {name}: ❌ Failed ({e})")
            
    elif "GROQ" in name:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            req = urllib.request.Request(url, data=json.dumps({"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"Hi"}]}).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {k}'})
            with urllib.request.urlopen(req, timeout=5) as res:
                print(f"[+] {name}: ✅ Working (Groq Llama 3.3)")
        except Exception as e:
            print(f"[!] {name}: ❌ Failed ({e})")
            
    elif "OPENROUTER" in name:
        try:
            url = "https://openrouter.ai/api/v1/chat/completions"
            req = urllib.request.Request(url, data=json.dumps({"model":"google/gemini-2.0-flash-lite-preview-02-05:free","messages":[{"role":"user","content":"Hi"}]}).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {k}'})
            with urllib.request.urlopen(req, timeout=5) as res:
                print(f"[+] {name}: ✅ Working (OpenRouter)")
        except Exception as e:
            print(f"[!] {name}: ❌ Failed ({e})")
