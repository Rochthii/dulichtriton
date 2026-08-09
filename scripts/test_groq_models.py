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
groq_key = env.get("GROQ_API_KEY")

for model in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]:
    url = "https://api.groq.com/openai/v1/chat/completions"
    req = urllib.request.Request(url, data=json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": "Giới thiệu 1 câu về Hồ Tà Pạ"}]
    }).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {groq_key}"})
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode("utf-8"))
            print(f"=== GROQ {model} SUCCESS ===")
            print(data["choices"][0]["message"]["content"])
            break
    except Exception as e:
        print(f"=== GROQ {model} FAILED ===", e)
