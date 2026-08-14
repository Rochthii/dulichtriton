import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv('frontend/.env.local')
key = os.environ.get('GEMINI_API_KEY')

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
req = urllib.request.Request(url)

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        models = [m['name'] for m in data.get('models', [])]
        print("Available models:")
        for m in models:
            if 'flash' in m or 'search' in m or 'gemini' in m:
                print(" -", m)
except Exception as e:
    print("Error:", e)
