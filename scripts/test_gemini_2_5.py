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
k1 = env.get("GEMINI_API_KEY")

for model in ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={k1}"
    req = urllib.request.Request(url, data=json.dumps({"contents":[{"parts":[{"text":"Chào bạn, giới thiệu 1 câu về Hồ Tà Pạ Tri Tôn"}]}]}).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode("utf-8"))
            print(f"=== {model} SUCCESS ===")
            print(data["candidates"][0]["content"]["parts"][0]["text"])
            break
    except Exception as e:
        print(f"=== {model} FAILED ===", e)
