"""
Test Script: Verification of Multi-Provider AI Fallback & Key Rotation Engine
"""
import os
import sys

import os
import sys

# Fix Windows UTF-8 stdout
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from ai_provider import generate_ai_response

def main():
    test_prompt = "Hãy giới thiệu ngắn gọn 2 câu về vẻ đẹp đặc sắc của du lịch Tri Tôn, An Giang."
    print(f"[TEST] Gửi câu hỏi kiểm tra: '{test_prompt}'\n")
    
    result = generate_ai_response(test_prompt)
    
    print("==========================================================================")
    print(f"Trạng thái: {result.get('status')}")
    print(f"Provider đã trả lời thành công: {result.get('provider')}")
    print("==========================================================================")
    print("Nội dung AI trả về:")
    print(result.get('text'))
    print("==========================================================================")

if __name__ == "__main__":
    main()
