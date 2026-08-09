import urllib.request
import json

url = "https://openrouter.ai/api/v1/models"
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode("utf-8"))
        models = data.get("data", [])
        free_models = [m["id"] for m in models if ":free" in m.get("id", "")]
        print("=== FREE OPENROUTER MODELS ===")
        for fm in free_models[:15]:
            print(fm)
except Exception as e:
    print(e)
