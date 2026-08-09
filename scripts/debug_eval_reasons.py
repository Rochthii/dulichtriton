import json
import urllib.request
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

url = "http://localhost:3000/api/v1/chat/query"
q = "Hồ Tà Pạ ở đâu, có gì đẹp?"
payload = json.dumps({"query": q, "session_id": "debug"}).encode("utf-8")
req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        print("=== TEXT RESPONSE ===")
        print(data.get("text_response"))
        print("\n=== PLACES ===")
        print(json.dumps(data.get("places"), indent=2, ensure_ascii=False))
except Exception as e:
    print(e)
