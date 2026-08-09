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
or_key = env.get("OPENROUTER_API_KEY")

for model in ["google/gemma-4-26b-a4b-it:free", "google/gemma-4-31b-it:free"]:
    url = "https://openrouter.ai/api/v1/chat/completions"
    req = urllib.request.Request(url, data=json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": "Giới thiệu 1 câu ngắn về Hồ Tà Pạ Tri Tôn An Giang."}]
    }).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {or_key}"})
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode("utf-8"))
            print(f"=== OPENROUTER {model} SUCCESS ===")
            print(data["choices"][0]["message"]["content"])
            break
    except Exception as e:
        print(f"=== OPENROUTER {model} FAILED ===", e)
