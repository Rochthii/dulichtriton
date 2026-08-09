import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
GEMINI_KEY = os.getenv('GEMINI_API_KEY')

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_KEY}"
try:
    with urllib.request.urlopen(url) as res:
        data = json.loads(res.read().decode('utf-8'))
        embedding_models = [m['name'] for m in data.get('models', []) if 'embed' in m['name'].lower()]
        print("Available Embedding Models:", embedding_models)
except Exception as e:
    print("Error listing models:", e)
