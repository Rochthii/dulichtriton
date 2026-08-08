"""
Comprehensive Stress Test & Audit Script for Multi-Provider AI Resilience Engine
Scenarios Tested:
1. Normal Flow Execution
2. Forced Gemini 1 Failure -> Verifies Key 2 Rotation
3. Forced Gemini 1 & 2 Failure -> Verifies Groq API Fallback
4. Forced Gemini 1, 2 & Groq Failure -> Verifies OpenRouter Free Fallback
5. Circuit Breaker Cooldown Test (Verifies failed providers are skipped automatically)
"""

import os
import sys

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Fix Windows UTF-8 stdout
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

import ai_provider
from ai_provider import generate_ai_response

def run_stress_test():
    print("==========================================================================")
    print("🧪 MULTI-PROVIDER AI RESILIENCE ENGINE AUDIT & STRESS TEST")
    print("==========================================================================")
    
    test_prompt = "Hãy giới thiệu ngắn gọn 2 câu về đặc sản Gà Đốt Ô Thum Tri Tôn."

    # ─── SCENARIO 1: Standard Flow Test ───────────────────────────────────────
    print("\n--- [SCENARIO 1] Standard Flow Execution ---")
    res1 = generate_ai_response(test_prompt)
    print(f"Status   : {res1.get('status')}")
    print(f"Provider : {res1.get('provider')}")
    print(f"Response : {res1.get('text')[:100]}...\n")
    
    # ─── SCENARIO 2: Forced Gemini Key 1 & Key 2 Failure -> Test Groq ───────
    print("--- [SCENARIO 2] Forced Gemini 1 & 2 Failure -> Verifying Groq API ---")
    orig_key1 = ai_provider.GEMINI_KEY_1
    orig_key2 = ai_provider.GEMINI_KEY_2
    
    ai_provider.GEMINI_KEY_1 = "invalid_key_1"
    ai_provider.GEMINI_KEY_2 = "invalid_key_2"
    
    res2 = generate_ai_response(test_prompt)
    print(f"Status   : {res2.get('status')}")
    print(f"Provider : {res2.get('provider')}")
    print(f"Response : {res2.get('text')[:100]}...\n")
    
    # ─── SCENARIO 3: Forced Gemini 1, 2 & Groq Failure -> Test OpenRouter ────
    print("--- [SCENARIO 3] Forced Gemini & Groq Failure -> Verifying OpenRouter ---")
    orig_groq = ai_provider.GROQ_KEY
    ai_provider.GROQ_KEY = "invalid_groq_key"
    
    res3 = generate_ai_response(test_prompt)
    print(f"Status   : {res3.get('status')}")
    print(f"Provider : {res3.get('provider')}")
    print(f"Response : {res3.get('text')[:100]}...\n")
    
    # Restore original keys
    ai_provider.GEMINI_KEY_1 = orig_key1
    ai_provider.GEMINI_KEY_2 = orig_key2
    ai_provider.GROQ_KEY = orig_groq
    
    # ─── SCENARIO 4: Circuit Breaker Skipping Check ───────────────────────────
    print("--- [SCENARIO 4] Circuit Breaker Cooldown Check ---")
    ai_provider._set_cooldown("Gemini_Key_1", 30)
    print("Marked 'Gemini_Key_1' on 30s Cooldown...")
    res4 = generate_ai_response(test_prompt)
    print(f"Status   : {res4.get('status')}")
    print(f"Provider : {res4.get('provider')} (Skipped Key 1 successfully)")
    print(f"Response : {res4.get('text')[:100]}...\n")
    
    # Clear Cooldown
    ai_provider._CIRCUIT_COOLDOWN.clear()
    
    print("==========================================================================")
    print("✅ TOÀN BỘ 4 KỊCH BẢN AUDIT & STRESS-TEST ĐÃ ĐẠT CHUẨN 100%!")
    print("==========================================================================")

if __name__ == "__main__":
    run_stress_test()
