import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
load_dotenv('.env.local')

or_key = os.getenv("OPENROUTER_API_KEY")

if not or_key:
    print("OPENROUTER_API_KEY not found")
    sys.exit(1)

# Fetch all models from OpenRouter
url = "https://openrouter.ai/api/v1/models"
req = urllib.request.Request(url, headers={"Authorization": f"Bearer {or_key}"})

try:
    with urllib.request.urlopen(req, timeout=10) as res:
        data = json.loads(res.read().decode('utf-8'))
        models = data.get('data', [])
        
        free_models = [m['id'] for m in models if m['id'].endswith(':free')]
        print(f"Total models available on OpenRouter: {len(models)}")
        print(f"Total ':free' models found: {len(free_models)}")
        print("\nList of all ':free' models:")
        for fm in sorted(free_models):
            print(f"  - {fm}")
            
except Exception as e:
    print(f"Error fetching OpenRouter models: {e}")
