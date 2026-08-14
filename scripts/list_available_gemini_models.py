import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv('frontend/.env.local')
k = os.getenv("GEMINI_API_KEY")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={k}"
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as res:
        models = json.loads(res.read().decode('utf-8'))
        print("Available models:")
        for m in models.get('models', []):
            if 'generateContent' in m.get('supportedGenerationMethods', []):
                print(" ", m['name'])
except Exception as e:
    print(e)
