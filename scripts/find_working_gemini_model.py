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

# List available models
list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={k1}"
req = urllib.request.Request(list_url)
try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode("utf-8"))
        print("=== AVAILABLE GEMINI MODELS ===")
        for m in data.get("models", []):
            if "generateContent" in m.get("supportedGenerationMethods", []):
                print(m.get("name"))
except Exception as e:
    print("Failed to list models:", e)
