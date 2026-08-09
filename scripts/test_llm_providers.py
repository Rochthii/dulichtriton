import os
import json
import urllib.request
import urllib.error
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def get_env():
    env_vars = {}
    for f in [".env", ".env.local"]:
        if os.path.exists(f):
            with open(f, "r", encoding="utf-8") as file:
                for line in file:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip()
    return env_vars

env = get_env()

# Test Gemini Key 1
k1 = env.get("GEMINI_API_KEY")
print("=== TESTING GEMINI KEY 1 ===")
url1 = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={k1}"
req1 = urllib.request.Request(url1, data=json.dumps({"contents":[{"parts":[{"text":"Say Hello in 3 words"}]}]}).encode("utf-8"), headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req1, timeout=5) as res:
        print("Gemini K1 Status:", res.status)
        print("Gemini K1 Text:", json.loads(res.read().decode("utf-8"))["candidates"][0]["content"]["parts"][0]["text"])
except Exception as e:
    print("Gemini K1 Exception:", e)

# Test Groq
groq_key = env.get("GROQ_API_KEY")
print("\n=== TESTING GROQ ===")
url_groq = "https://api.groq.com/openai/v1/chat/completions"
req_groq = urllib.request.Request(url_groq, data=json.dumps({
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Say Hello in 3 words"}]
}).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {groq_key}"})
try:
    with urllib.request.urlopen(req_groq, timeout=5) as res:
        print("Groq Status:", res.status)
        print("Groq Text:", json.loads(res.read().decode("utf-8"))["choices"][0]["message"]["content"])
except Exception as e:
    print("Groq Exception:", e)

# Test OpenRouter
or_key = env.get("OPENROUTER_API_KEY")
print("\n=== TESTING OPENROUTER ===")
url_or = "https://openrouter.ai/api/v1/chat/completions"
req_or = urllib.request.Request(url_or, data=json.dumps({
    "model": "meta-llama/llama-3.3-70b-instruct:free",
    "messages": [{"role": "user", "content": "Say Hello in 3 words"}]
}).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {or_key}"})
try:
    with urllib.request.urlopen(req_or, timeout=5) as res:
        print("OpenRouter Status:", res.status)
        print("OpenRouter Text:", json.loads(res.read().decode("utf-8"))["choices"][0]["message"]["content"])
except Exception as e:
    print("OpenRouter Exception:", e)
