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
k2 = env.get("GEMINI_API_KEY_2")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={k2}"
req = urllib.request.Request(url, data=json.dumps({"contents":[{"parts":[{"text":"Giới thiệu 1 câu về Hồ Tà Pạ"}]}]}).encode("utf-8"), headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req, timeout=5) as res:
        data = json.loads(res.read().decode("utf-8"))
        print("=== KEY 2 SUCCESS ===")
        print(data["candidates"][0]["content"]["parts"][0]["text"])
except Exception as e:
    print("=== KEY 2 FAILED ===", e)
