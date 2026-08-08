"""
Multi-Provider AI Resilience Engine with Automatic Quota Fallback & Provider Rotation (v2.0)
System: Du Lịch Tri Tôn AI Assistant System
Priority: Gemini Key 1 -> Gemini Key 2 (Rotation) -> Groq API -> OpenRouter (:free models)
Features: Circuit Breaker Cooldown, Per-Provider Fast Timeout, Multi-turn Chat Support
"""

import os
import sys
import json
import time
import logging
import urllib.request
import urllib.parse
from dotenv import load_dotenv

# Load environment variables from .env.local in root or frontend
env_root = os.path.join(os.path.dirname(__file__), '..', '.env.local')
env_frontend = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')

if os.path.exists(env_root):
    load_dotenv(dotenv_path=env_root)
if os.path.exists(env_frontend):
    load_dotenv(dotenv_path=env_frontend)
load_dotenv()

logger = logging.getLogger("triton_ai_provider")
logger.setLevel(logging.INFO)

# Load Keys dynamically from environment (NEVER hardcoded)
GEMINI_KEY_1 = os.getenv("GEMINI_API_KEY", "")
GEMINI_KEY_2 = os.getenv("GEMINI_API_KEY_2", "")
GROQ_KEY = os.getenv("GROQ_API_KEY", "")
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "")

# ─── Circuit Breaker State Store (In-Memory Cooldown) ─────────────────────────
# Format: { "provider_name": cooldown_expiration_timestamp }
_CIRCUIT_COOLDOWN = {}
COOLDOWN_SECONDS = 300  # 5 minutes cooldown when a key hits 429 / quota error


def _is_in_cooldown(provider_name: str) -> bool:
    """Check if a provider is currently blocked by circuit breaker"""
    exp = _CIRCUIT_COOLDOWN.get(provider_name, 0)
    if time.time() < exp:
        return True
    return False


def _set_cooldown(provider_name: str, duration: int = COOLDOWN_SECONDS):
    """Mark a provider as blocked for N seconds"""
    _CIRCUIT_COOLDOWN[provider_name] = time.time() + duration
    logger.warning(f"⛔ Circuit Breaker: Provider '{provider_name}' placed on {duration}s cooldown.")


# ─── System Role Directive & Domain Boundary Contract ──────────────────────────
SYSTEM_CONTRACT_PROMPT = """
# ROLE & DOMAIN BOUNDARY CONTRACT
You are the AI Assistant for the "Du Lịch Tri Tôn" project (Tri Tôn, An Giang, Vietnam).
Your sole purpose is to support, analyze, retrieve, verify, and explain information directly relevant to Tri Tôn tourism and the Du Lịch Tri Tôn project.

# STRICT DOMAIN SCOPE
You may ONLY answer questions concerning:
1. Tri Tôn, An Giang, Vietnam.
2. Tourism in Tri Tôn, 95 Verified POIs Dataset, Khmer culture, heritage, history, attractions, food, accommodation, and tourism activities in Tri Tôn.
3. System design, data analysis, database, backend, frontend, AI, search, recommendation tasks ONLY when they belong to the Du Lịch Tri Tôn project.

# STRICT OUT-OF-SCOPE POLICY
If a user asks about something unrelated to Tri Tôn or unrelated to the Du Lịch Tri Tôn project (e.g. general news, programming, travel outside Tri Tôn, general knowledge):
DO NOT answer the question.
Respond EXACTLY with:
"Tôi chỉ hỗ trợ các nội dung liên quan đến Tri Tôn và dự án Du Lịch Tri Tôn. Bạn hãy đặt câu hỏi trong phạm vi này."

# DATA INTEGRITY & EVIDENCE POLICY
Never fabricate POI names, addresses, coordinates, opening hours, prices, ratings, creators, or tourism facts.
If reliable evidence is unavailable, state:
"Tôi không có đủ dữ liệu để xác minh chính xác thông tin này."
"""

# ─── Provider Implementations ─────────────────────────────────────────────────

def _call_gemini(prompt: str, api_key: str, key_label: str, timeout: float = 4.0) -> str:
    """Call Google Gemini Flash API via REST endpoint with model fallback & System Contract"""
    if not api_key:
        raise ValueError(f"Missing API key for {key_label}")
    
    models = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash-exp", "gemini-1.5-flash"]
    last_err = None
    
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "system_instruction": {
                "parts": [{"text": SYSTEM_CONTRACT_PROMPT}]
            },
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 800
            }
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            logger.info(f"✅ Success from {key_label} (model: {model})")
                            return parts[0].get("text", "").strip()
        except urllib.error.HTTPError as http_err:
            last_err = http_err
            if http_err.code == 429:
                _set_cooldown(key_label, COOLDOWN_SECONDS)
                raise http_err
            elif http_err.code in (403, 404):
                continue
            else:
                raise http_err
        except Exception as e:
            last_err = e
            continue
            
    raise RuntimeError(f"{key_label} failed on all models. Last error: {last_err}")


def _call_groq(prompt: str, api_key: str, timeout: float = 4.0) -> str:
    """Call Groq API (OpenAI compatible) with System Contract message"""
    if not api_key:
        raise ValueError("Missing GROQ_API_KEY")
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768"]
    last_err = None
    
    for model in models:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_CONTRACT_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 800
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        )
        
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    choices = data.get("choices", [])
                    if choices:
                        logger.info(f"✅ Success from Groq API (model: {model})")
                        return choices[0]["message"]["content"].strip()
        except urllib.error.HTTPError as http_err:
            last_err = http_err
            if http_err.code == 429:
                _set_cooldown("Groq_API", COOLDOWN_SECONDS)
            continue
        except Exception as e:
            last_err = e
            continue
            
    raise RuntimeError(f"Groq API failed. Last error: {last_err}")


def _call_openrouter(prompt: str, api_key: str, timeout: float = 5.0) -> str:
    """Call OpenRouter API using System Contract message"""
    if not api_key:
        raise ValueError("Missing OPENROUTER_API_KEY")
        
    url = "https://openrouter.ai/api/v1/chat/completions"
    free_models = [
        "meta-llama/llama-3.1-8b-instruct",
        "meta-llama/llama-3.3-70b-instruct",
        "mistralai/mistral-7b-instruct",
        "google/gemini-2.0-flash-lite-001"
    ]
    last_err = None
    
    for model in free_models:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_CONTRACT_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 800
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "HTTP-Referer": "https://dulichtriton.vn",
                "X-Title": "Tri Ton Tourism AI"
            }
        )
        
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    choices = data.get("choices", [])
                    if choices:
                        logger.info(f"✅ Success from OpenRouter (model: {model})")
                        return choices[0]["message"]["content"].strip()
        except urllib.error.HTTPError as http_err:
            last_err = http_err
            if http_err.code == 429:
                _set_cooldown("OpenRouter_Free", COOLDOWN_SECONDS)
            continue
        except Exception as e:
            last_err = e
            continue
            
    raise RuntimeError(f"OpenRouter API failed. Last error: {last_err}")


# ─── Main Resilience Switcher ─────────────────────────────────────────────────

def generate_ai_response(prompt: str) -> dict:
    """
    Main Multi-Provider Resilience Switcher with Circuit Breaker.
    Priority Flow:
    1. Gemini Key 1 (if not in cooldown)
    2. Gemini Key 2 (Rotation - if not in cooldown)
    3. Groq API (if not in cooldown)
    4. OpenRouter (:free suffix models)
    """
    providers = [
        ("Gemini_Key_1", lambda: _call_gemini(prompt, GEMINI_KEY_1, "Gemini_Key_1")),
        ("Gemini_Key_2", lambda: _call_gemini(prompt, GEMINI_KEY_2, "Gemini_Key_2")),
        ("Groq_API", lambda: _call_groq(prompt, GROQ_KEY)),
        ("OpenRouter_Free", lambda: _call_openrouter(prompt, OPENROUTER_KEY))
    ]
    
    errors = []
    
    for name, func in providers:
        if _is_in_cooldown(name):
            logger.info(f"⏭️ Skipping '{name}' (Active Circuit Breaker Cooldown)")
            errors.append(f"{name}: Skipped due to Cooldown")
            continue
            
        try:
            text = func()
            if text:
                return {
                    "text": text,
                    "provider": name,
                    "status": "success"
                }
        except Exception as e:
            err_msg = f"{name} failed: {e}"
            logger.warning(f"🔄 Auto-fallback triggered: {err_msg}")
            errors.append(err_msg)
            
    # All providers exhausted
    return {
        "text": "",
        "provider": "none",
        "status": "exhausted",
        "errors": errors
    }
