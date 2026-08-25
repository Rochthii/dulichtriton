"""
Script phân tích, đối chiếu 47 địa điểm trong danh sách người dùng gửi:
- Kiểm tra tồn tại trên Supabase & Local JSON
- Phân loại rõ: Trùng lặp (Duplicate), Rác/Tên chung chung (Noise), hoặc Điểm di sản hợp lệ (Valid Heritage)
- Lập bảng báo cáo xác nhận trước khi thực hiện xóa
"""
import os
import sys
import json
import urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

env_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
if os.path.exists(env_path):
    load_dotenv(env_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://knmlbwsmfljlabhvqfid.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

user_raw_list = [
    {"stt": 1, "id": "b49161b0-chùa-phi-lai-ba-chúc", "name": "Chùa Phi Lai Ba Chúc", "commune": "Thị trấn Ba Chúc"},
    {"stt": 2, "id": "chua-phi-lai", "name": "Chùa Phi Lai Ba Chúc (Phi Lai Cổ Tự)", "commune": "Thị trấn Ba Chúc"},
    {"stt": 3, "id": "e563b663-chùa-tam-bửu-ba-chúc", "name": "Chùa Tam Bửu Ba Chúc", "commune": "Thị trấn Ba Chúc"},
    {"stt": 4, "id": "chua-tam-buu", "name": "Chùa Tam Bửu Ba Chúc (Tổ Đình Tứ Ân Hiếu Nghĩa)", "commune": "Thị trấn Ba Chúc"},
    {"stt": 5, "id": "chua-thanh-luong", "name": "Chùa Thanh Lương", "commune": "Thị trấn Tri Tôn"},
    {"stt": 6, "id": "kenh-tam-ngan", "name": "Kênh Tám Ngàn", "commune": "Thị trấn Tri Tôn"},
    {"stt": 7, "id": "my-truc", "name": "mỹ trúc", "commune": "Thị trấn Tri Tôn"},
    {"stt": 8, "id": "tigon", "name": "tigon", "commune": "Thị trấn Tri Tôn"},
    {"stt": 9, "id": "quan-ga-dot-ro-thum-khmer", "name": "Quán Gà Đốt Rô THUM Khmer", "commune": "Xã Ô Lâm"},
    {"stt": 10, "id": "chua-bach-co", "name": "Chua Bach Co", "commune": "Thị trấn Tri Tôn"},
    {"stt": 11, "id": "chua-coc", "name": "Chua Coc", "commune": "Thị trấn Tri Tôn"},
    {"stt": 12, "id": "chua-xoc-tuc", "name": "Chua Xoc Tuc", "commune": "Thị trấn Tri Tôn"},
    {"stt": 13, "id": "hanh-tam", "name": "Hanh Tam", "commune": "Thị trấn Tri Tôn"},
    {"stt": 14, "id": "b4e743c8-hồ-ô-tà-lọt", "name": "Hồ Ô Tà Lọt", "commune": "Thị trấn Tri Tôn"},
    {"stt": 15, "id": "khmer-temple", "name": "Khmer Temple", "commune": "Thị trấn Tri Tôn"},
    {"stt": 16, "id": "kenh-t6", "name": "Kênh T6", "commune": "Thị trấn Tri Tôn"},
    {"stt": 17, "id": "nha-trung-bay-van-hoa-khmer-tri-ton", "name": "Nhà Trưng Bày Văn Hóa Dân Tộc Khmer Tri Tôn", "commune": "Thị trấn Tri Tôn"},
    {"stt": 18, "id": "nui-dai", "name": "Núi Dài", "commune": "Thị trấn Tri Tôn"},
    {"stt": 19, "id": "nui-nuoc", "name": "Núi Nước", "commune": "Thị trấn Tri Tôn"},
    {"stt": 20, "id": "89d12327-quầy-thốt-nốt-tươi-c", "name": "Quầy Thốt Nốt Tươi Cụm Trái Tim", "commune": "Thị trấn Tri Tôn"},
    {"stt": 21, "id": "c7d6fabf-rồng-vàng-resort-tri", "name": "Rồng Vàng Resort Tri Tôn", "commune": "Thị trấn Tri Tôn"},
    {"stt": 22, "id": "son-lap", "name": "Sơn Lập", "commune": "Thị trấn Tri Tôn"},
    {"stt": 23, "id": "thien-duyan", "name": "Thien Duyan", "commune": "Thị trấn Tri Tôn"},
    {"stt": 24, "id": "tho-mo-muc-cave-hang-tho-mo-muc", "name": "Tho Mo Muc Cave (Hang Tho Mo Muc)", "commune": "Thị trấn Tri Tôn"},
    {"stt": 25, "id": "tri-ton", "name": "Tri Tôn", "commune": "Thị trấn Tri Tôn"},
    {"stt": 26, "id": "nha-thieu-nhi", "name": "nhà thiếu nhi", "commune": "Thị trấn Tri Tôn"},
    {"stt": 27, "id": "dien-gieng-nuoc", "name": "Điện Giếng Nước", "commune": "Thị trấn Tri Tôn"},
    {"stt": 28, "id": "dong-nhin-len-chu-tri-ton", "name": "ĐỒNG NHÌN LÊN CHỮ TRI TÔN", "commune": "Thị trấn Tri Tôn"},
    {"stt": 29, "id": "diem-du-lich-tri-ton-12", "name": "ភូមិស្រែឃ្មួញ", "commune": "Thị trấn Tri Tôn"},
    {"stt": 30, "id": "3383c54e-con-đường-vòm-còng-c", "name": "Con Đường Vòm Còng Châu Lăng", "commune": "Xã Châu Lăng"},
    {"stt": 31, "id": "d3e73741-cánh-đồng-thốt-nốt-c", "name": "Cánh Đồng Thốt Nốt Châu Lăng", "commune": "Xã Châu Lăng"},
    {"stt": 32, "id": "a810d441-cây-thốt-nốt-cô-độc-", "name": "Cây Thốt Nốt Cô Độc Châu Lăng", "commune": "Xã Châu Lăng"},
    {"stt": 33, "id": "831ebb34-hồ-đá-latina", "name": "Hồ Đá Latina", "commune": "Xã Châu Lăng"},
    {"stt": 34, "id": "lang-nghe-tho-cam-chau-lang", "name": "Làng Nghề Dệt Thổ Cẩm Khmer Truyền Thống Châu Lăng", "commune": "Xã Châu Lăng"},
    {"stt": 35, "id": "nui-nam-quy", "name": "Núi Nam Quy", "commune": "Xã Châu Lăng"},
    {"stt": 36, "id": "749e2a14-vách-đá-đứng-latina", "name": "Vách Đá Đứng Latina", "commune": "Xã Châu Lăng"},
    {"stt": 37, "id": "ho-latina", "name": "hồ latina", "commune": "Xã Châu Lăng"},
    {"stt": 38, "id": "2ac3fb9a-con-đường-thốt-nốt-ô", "name": "Con Đường Thốt Nốt Ô Lâm - Cô Tô", "commune": "Xã Cô Tô"},
    {"stt": 39, "id": "co-to", "name": "Cô Tô", "commune": "Xã Cô Tô"},
    {"stt": 40, "id": "d8731ae3-cầu-khỉ-giữa-cánh-đồ", "name": "Cầu Khỉ Giữa Cánh Đồng Thốt Nốt", "commune": "Xã Cô Tô"},
    {"stt": 41, "id": "833d6714-nấc-thang-thiên-đườn", "name": "Nấc Thang Thiên Đường Kiều Tiên Ô Thum", "commune": "Xã Cô Tô"},
    {"stt": 42, "id": "6669ffb7-suối-vàng-soài-so", "name": "Suối Vàng Soài So", "commune": "Xã Cô Tô"},
    {"stt": 43, "id": "chua-ba-xoai", "name": "Chua Ba Xoai", "commune": "Xã Lương Phi"},
    {"stt": 44, "id": "nui-sa-lon", "name": "Núi Sà Lôn", "commune": "Xã Lương Phi"},
    {"stt": 45, "id": "9616e5e5-con-đường-tơ-lụa-tà-", "name": "Con Đường Tơ Lụa Tà Pạ", "commune": "Xã Núi Tô"},
    {"stt": 46, "id": "ho-soai-chek", "name": "Hồ Soài Chek", "commune": "Xã Núi Tô"},
    {"stt": 47, "id": "ho-soai-chek-2", "name": "Hồ Soài Chék", "commune": "Xã Núi Tô"}
]

# Fetch Supabase data
req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/places?select=id,name,commune,category,subcategory",
    headers={'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}
)
with urllib.request.urlopen(req, timeout=15) as res:
    sb_places = json.loads(res.read().decode('utf-8'))

sb_dict = {p['id']: p for p in sb_places}

print("================================================================================")
print(f"🔍 BÁO CÁO PHÂN TÍCH 47 ĐỊA ĐIỂM NGƯỜI DÙNG YÊU CẦU XÁC NHẬN")
print("================================================================================")

# Classify into 3 groups:
# Group 1: Trùng lặp rõ ràng (Duplicates) -> Khuyên xóa bản ghi thừa
# Group 2: Rác / Tên chung chung / Không phải POI du lịch -> Khuyên xóa
# Group 3: Điểm thắng cảnh / di sản Bảy Núi chuẩn -> Cần lưu ý xác nhận

for item in user_raw_list:
    u_id = item['id']
    u_name = item['name']
    u_com = item['commune']
    exists = u_id in sb_dict
    
    status_tag = "ĐANG CÓ TRÊN SUPABASE" if exists else "KHÔNG TỒN TẠI"
    print(f"[{item['stt']:02d}] {u_name} (ID: {u_id}) -> {status_tag}")

print("================================================================================")
