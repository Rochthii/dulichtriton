import os
import json
import urllib.request
import sys
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')
openrouter_key = os.environ.get('OPENROUTER_API_KEY')

url = "https://openrouter.ai/api/v1/chat/completions"
system_prompt = """Bạn là Trợ lý Du Lịch Tri Tôn AI (Tri Tôn, An Giang, vùng Bảy Núi).
Trình bày câu trả lời theo phong cách Google AI Overview (ngắn gọn, súc tích, phân nhóm rõ ràng).
Chỉ sử dụng thông tin thuộc Tri Tôn, An Giang."""

user_prompt = """Bối cảnh địa danh Tri Tôn, An Giang:
1. Hồ Tà Pạ (Xã Núi Tô): Tuyệt Tình Cốc Bảy Núi, nước xanh ngọc bích.
2. Gà đốt Ô Thum (Xã Ô Lâm): Đặc sản gà đốt lá chúc giòn da thơm nức.
3. Chùa Xvayton / Xà Tón (Thị trấn Tri Tôn): Chùa Khmer cổ nhất lưu giữ Kinh Lá Buông.
4. Đu đủ đâm RiNa (Xã Châu Lăng): Món ăn vặt trứ danh Khmer.

Câu hỏi: Tri Tôn có gì chơi?"""

payload = {
    "model": "nvidia/nemotron-3-nano-30b-a3b:free",
    "messages": [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {openrouter_key}',
        'HTTP-Referer': 'https://dulichtriton.vn',
        'X-Title': 'Du Lich Tri Ton AI'
    }
)

with urllib.request.urlopen(req, timeout=10) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print("=== OPENROUTER WITH TRI TON GROUNDING ===")
    print(data['choices'][0]['message']['content'])
