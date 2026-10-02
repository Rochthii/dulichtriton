"""
scripts/test_embedding.py
Test script for Gemini Embedding API (gemini-embedding-001).

REMEDIATION (P05-009):
Network calls are strictly decoupled from import-time.
Importing this module MUST NOT perform any network / HTTP socket requests.
All execution logic is deferred to `test_gemini_embedding()` or triggered via `__main__`.
"""
import os
import sys
import json
import urllib.request
from typing import Optional, Dict, Any, Tuple
from dotenv import load_dotenv

if sys.platform == 'win32' and sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def build_embedding_request(
    api_key: Optional[str] = None,
    text: str = "Tri Tôn An Giang Hồ Tà Pạ",
    output_dim: int = 768
) -> Tuple[str, bytes, Dict[str, str]]:
    """Build URL, encoded payload and headers for Gemini Embedding request without network calls."""
    key = api_key or os.getenv('GEMINI_API_KEY') or ''
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={key}"
    payload = {
        "model": "models/gemini-embedding-001",
        "content": {
            "parts": [{"text": text}]
        },
        "outputDimensionality": output_dim
    }
    body_bytes = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    return url, body_bytes, headers


def test_gemini_embedding(
    api_key: Optional[str] = None,
    text: str = "Tri Tôn An Giang Hồ Tà Pạ",
    output_dim: int = 768,
    urlopen_fn=None
) -> Dict[str, Any]:
    """
    Execute Gemini Embedding test on-demand.
    Network calls only happen when this function is explicitly invoked.
    Supports dependency injection for offline unit tests and mocking.
    """
    load_dotenv('frontend/.env.local')
    key = api_key or os.getenv('GEMINI_API_KEY')
    if not key and urlopen_fn is None:
        raise ValueError("Missing GEMINI_API_KEY environment variable")

    url, body_bytes, headers = build_embedding_request(key, text, output_dim)
    req = urllib.request.Request(url, data=body_bytes, headers=headers)

    caller = urlopen_fn or urllib.request.urlopen
    try:
        with caller(req) as res:
            raw_data = res.read().decode('utf-8')
            data = json.loads(raw_data)
            vec = data.get('embedding', {}).get('values', [])
            print(f"✅ SUCCESS with outputDimensionality={output_dim}! Vector dimension: {len(vec)}")
            return {
                "success": True,
                "dimension": len(vec),
                "embedding": vec
            }
    except Exception as e:
        print("❌ Failed:", e)
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    test_gemini_embedding()
