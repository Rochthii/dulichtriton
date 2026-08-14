"""
Script: create_preset_itineraries.py
Tạo bảng preset_itineraries trong Supabase và seed 8 lịch trình du lịch Tri Tôn.
"""
import os, json, sys, urllib.request
from dotenv import load_dotenv

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv('frontend/.env.local')

SUPABASE_URL = os.environ['NEXT_PUBLIC_SUPABASE_URL']
SERVICE_KEY  = os.environ['SUPABASE_SERVICE_ROLE_KEY']

def supabase_rpc(sql: str):
    """Execute raw SQL via Supabase REST API (service role)."""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    payload = json.dumps({"sql": sql}).encode('utf-8')
    req = urllib.request.Request(
        url, data=payload,
        headers={
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f"  [WARN] RPC exec_sql not available: {e.code} — {body[:200]}")
        return None

def upsert_rows(table: str, rows: list):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    payload = json.dumps(rows).encode('utf-8')
    req = urllib.request.Request(
        url, data=payload,
        headers={
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
            'Prefer': 'resolution=merge-duplicates,return=minimal',
        }
    )
    req.get_method = lambda: 'POST'
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f"  [ERR] Upsert {table}: {e.code} — {body[:300]}")
        return e.code

# ── 8 PRESET ITINERARIES DATA ─────────────────────────────────────────────────
PRESETS = [
  {
    "slug": "classic-1day",
    "emoji": "🔥",
    "title": "Kinh Điển 1 Ngày",
    "tagline": "Đủ ảnh + Đủ no + Đủ cảm xúc trong 1 ngày",
    "for_whom": "Lần đầu tới Tri Tôn, muốn đủ cả thiên nhiên + văn hóa + ẩm thực",
    "duration": "8 tiếng",
    "budget_range": "350k–600k/người",
    "sort_order": 1,
    "stops": [
      {
        "order": 1, "name": "Hồ Tà Pạ", "commune": "Xã Núi Tô",
        "category": "check-in", "time_start": "06:30", "time_end": "08:30",
        "duration_min": 120, "tip": "Đến trước 7h để chụp ảnh nước xanh ngọc bích trước khi đông người",
        "travel_to_next_min": 5, "travel_to_next_km": 1.5,
        "photo_coords": [10.4165, 105.0042]
      },
      {
        "order": 2, "name": "Chùa Tà Pạ", "commune": "Xã Núi Tô",
        "category": "spiritual", "time_start": "08:45", "time_end": "09:30",
        "duration_min": 45, "tip": "Mặc áo che vai khi vào chùa Khmer, không chụp ảnh tượng Phật",
        "travel_to_next_min": 25, "travel_to_next_km": 9,
        "photo_coords": [10.4178, 105.0025]
      },
      {
        "order": 3, "name": "Cổng Trời Koh Kas", "commune": "Xã Châu Lăng",
        "category": "check-in", "time_start": "10:00", "time_end": "11:00",
        "duration_min": 60, "tip": "Góc check-in đẹp nhất là đứng trong cổng hướng về phía đồng lúa, sáng sớm hoặc chiều 4-5h",
        "travel_to_next_min": 20, "travel_to_next_km": 7,
        "photo_coords": [10.4010, 104.9620]
      },
      {
        "order": 4, "name": "Quán Gà Đốt Ô Thum", "commune": "Xã Ô Lâm",
        "category": "food", "time_start": "11:30", "time_end": "13:00",
        "duration_min": 90, "tip": "Gọi gà đốt + canh chua lá me + cơm tấm. 2 người ~280k–350k/con gà",
        "travel_to_next_min": 20, "travel_to_next_km": 8,
        "photo_coords": [10.3820, 104.9880]
      },
      {
        "order": 5, "name": "Ô Tà Sóc", "commune": "Xã Lương Phi",
        "category": "nature", "time_start": "13:30", "time_end": "15:30",
        "duration_min": 120, "tip": "Bước qua khe đá hẹp để vào hang bí ẩn — mang giày thể thao, không đi dép lê",
        "travel_to_next_min": 30, "travel_to_next_km": 12,
        "photo_coords": [10.3500, 104.9400]
      },
      {
        "order": 6, "name": "Chùa Xvayton (Xà Tón)", "commune": "Thị trấn Tri Tôn",
        "category": "spiritual", "time_start": "16:00", "time_end": "17:00",
        "duration_min": 60, "tip": "Chùa Khmer cổ nhất vùng Bảy Núi, lưu giữ Kinh Lá Buông hàng trăm năm tuổi",
        "travel_to_next_min": 0, "travel_to_next_km": 0,
        "photo_coords": [10.3670, 104.9990]
      }
    ]
  },
  {
    "slug": "tiktok-viral",
    "emoji": "📸",
    "title": "Sống Ảo TikTok Triệu View",
    "tagline": "Mỗi điểm là 1 trend — có video review thật từ người đã đi",
    "for_whom": "Giới trẻ, content creator, muốn có ảnh + video đẹp cho mạng xã hội",
    "duration": "7 tiếng",
    "budget_range": "200k–400k/người",
    "sort_order": 2,
    "stops": [
      {
        "order": 1, "name": "Hồ Soài So (Soài Chek)", "commune": "Xã Ô Lâm",
        "category": "check-in", "time_start": "06:00", "time_end": "07:30",
        "duration_min": 90, "tip": "Bình minh phản chiếu trên hồ — chụp từ bờ phía Đông, ánh sáng đẹp nhất 6:00–6:45",
        "travel_to_next_min": 30, "travel_to_next_km": 12,
        "photo_coords": [10.4050, 104.9520]
      },
      {
        "order": 2, "name": "Cổng Trời Koh Kas", "commune": "Xã Châu Lăng",
        "category": "check-in", "time_start": "08:15", "time_end": "09:15",
        "duration_min": 60, "tip": "Đứng trong cổng đá nhìn về phía đồng lúa — cách chụp: dùng góc rộng, ánh sáng chiều còn đẹp hơn sáng",
        "travel_to_next_min": 25, "travel_to_next_km": 10,
        "photo_coords": [10.4010, 104.9620]
      },
      {
        "order": 3, "name": "Hồ Tà Pạ", "commune": "Xã Núi Tô",
        "category": "check-in", "time_start": "10:00", "time_end": "11:30",
        "duration_min": 90, "tip": "Góc sống ảo triệu view: đứng trên bờ đá nhìn xuống — nước xanh + núi phía sau. Mang đồ màu trắng/xanh",
        "travel_to_next_min": 20, "travel_to_next_km": 8,
        "photo_coords": [10.4165, 105.0042]
      },
      {
        "order": 4, "name": "Đu Đủ Đâm RiNa", "commune": "Xã Châu Lăng",
        "category": "food", "time_start": "12:00", "time_end": "12:45",
        "duration_min": 45, "tip": "Quay video đang ăn đu đủ đâm kiểu Khmer — đây là content ẩm thực trending nhất Tri Tôn trên TikTok",
        "travel_to_next_min": 15, "travel_to_next_km": 5,
        "photo_coords": [10.4020, 104.9680]
      },
      {
        "order": 5, "name": "Đồi Tức Dụp (Núi Hai Vai)", "commune": "Xã An Tức",
        "category": "nature", "time_start": "13:30", "time_end": "15:30",
        "duration_min": 120, "tip": "Leo đỉnh — nhìn toàn cảnh đồng bằng và núi Bảy Núi. Hiệu ứng ánh sáng chiều vàng rực",
        "travel_to_next_min": 0, "travel_to_next_km": 0,
        "photo_coords": [10.3710, 104.9620]
      }
    ]
  },
  {
    "slug": "spiritual-family",
    "emoji": "🙏",
    "title": "Tâm Linh & Văn Hóa Khmer",
    "tagline": "Hành trình tìm về tâm hồn yên bình Bảy Núi",
    "for_whom": "Gia đình có người lớn tuổi, người muốn tìm hiểu văn hóa Phật giáo Nam Tông Khmer",
    "duration": "6 tiếng",
    "budget_range": "150k–250k/người",
    "sort_order": 3,
    "stops": [
      {
        "order": 1, "name": "Chùa Xvayton (Xà Tón)", "commune": "Thị trấn Tri Tôn",
        "category": "spiritual", "time_start": "07:00", "time_end": "08:30",
        "duration_min": 90, "tip": "Ngôi chùa Khmer cổ nhất An Giang — lưu giữ bộ Kinh Lá Buông 200 năm tuổi viết bằng chữ Pali cổ",
        "travel_to_next_min": 25, "travel_to_next_km": 9,
        "photo_coords": [10.3670, 104.9990]
      },
      {
        "order": 2, "name": "Chùa Tà Pạ", "commune": "Xã Núi Tô",
        "category": "spiritual", "time_start": "09:00", "time_end": "10:00",
        "duration_min": 60, "tip": "Phối hợp thăm Hồ Tà Pạ bên cạnh — chùa nằm lưng chừng núi, view nhìn xuống hồ rất đẹp và bình yên",
        "travel_to_next_min": 35, "travel_to_next_km": 14,
        "photo_coords": [10.4178, 105.0025]
      },
      {
        "order": 3, "name": "Nhà Mồ Ba Chúc", "commune": "Xã Ba Chúc",
        "category": "history", "time_start": "10:45", "time_end": "12:00",
        "duration_min": 75, "tip": "Nơi tưởng niệm 3.157 người dân vô tội bị thảm sát năm 1978 — mặc đồ lịch sự, giữ yên lặng và tôn kính",
        "travel_to_next_min": 20, "travel_to_next_km": 7,
        "photo_coords": [10.2980, 104.9450]
      },
      {
        "order": 4, "name": "Chùa Phi Lai", "commune": "Xã Ba Chúc",
        "category": "spiritual", "time_start": "12:30", "time_end": "13:30",
        "duration_min": 60, "tip": "Chùa Phật giáo Hòa Hảo cổ kính, yên tĩnh — không gian thiền định và lịch sử tôn giáo vùng Bảy Núi",
        "travel_to_next_min": 0, "travel_to_next_km": 0,
        "photo_coords": [10.3010, 104.9410]
      }
    ]
  },
  {
    "slug": "trekking-adventure",
    "emoji": "🥾",
    "title": "Trekking Bảy Núi",
    "tagline": "Chinh phục đỉnh cao — khám phá những gì ẩn sâu trong núi",
    "for_whom": "Phượt thủ, người thích vận động, leo núi và khám phá thiên nhiên hoang sơ",
    "duration": "9 tiếng",
    "budget_range": "100k–200k/người",
    "sort_order": 4,
    "stops": [
      {
        "order": 1, "name": "Núi Cô Tô (Vồ Hội)", "commune": "Xã Cô Tô",
        "category": "nature", "time_start": "05:30", "time_end": "09:00",
        "duration_min": 210, "tip": "Xuất phát 5:30 để lên đỉnh kịp bình minh — đỉnh cao nhất An Giang 614m, cần mang đủ nước và đèn pin",
        "travel_to_next_min": 45, "travel_to_next_km": 18,
        "photo_coords": [10.2940, 105.0380]
      },
      {
        "order": 2, "name": "Ô Tà Sóc", "commune": "Xã Lương Phi",
        "category": "nature", "time_start": "10:00", "time_end": "12:00",
        "duration_min": 120, "tip": "Thung lũng bí ẩn giữa núi, hang đá chằng chịt — điểm khám phá ẩn mình nhất Bảy Núi, nên thuê người dẫn đường",
        "travel_to_next_min": 30, "travel_to_next_km": 12,
        "photo_coords": [10.3500, 104.9400]
      },
      {
        "order": 3, "name": "Suối Soài So", "commune": "Xã Ô Lâm",
        "category": "nature", "time_start": "13:00", "time_end": "14:30",
        "duration_min": 90, "tip": "Suối nước trong chảy giữa vách đá — tắm suối giải nhiệt sau chuyến leo núi dài, nước mát quanh năm",
        "travel_to_next_min": 20, "travel_to_next_km": 8,
        "photo_coords": [10.4060, 104.9510]
      },
      {
        "order": 4, "name": "Quán Gà Đốt Ô Thum", "commune": "Xã Ô Lâm",
        "category": "food", "time_start": "15:00", "time_end": "16:30",
        "duration_min": 90, "tip": "Sau chuyến trekking dài, bữa gà đốt nướng than hồng là phần thưởng xứng đáng — gọi thêm canh chua me",
        "travel_to_next_min": 0, "travel_to_next_km": 0,
        "photo_coords": [10.3820, 104.9880]
      }
    ]
  },
  {
    "slug": "food-tour",
    "emoji": "🍗",
    "title": "Food Tour Bảy Núi",
    "tagline": "Ăn từ sáng đến tối — mỗi món là một bản sắc văn hóa",
    "for_whom": "Team mê ăn, muốn trải nghiệm đặc sản vùng Bảy Núi An Giang",
    "duration": "6 tiếng",
    "budget_range": "250k–500k/người",
    "sort_order": 5,
    "stops": [
      {
        "order": 1, "name": "Bánh Bò Thốt Nốt Út Cột", "commune": "Thị trấn Tri Tôn",
        "category": "food", "time_start": "07:00", "time_end": "07:45",
        "duration_min": 45, "tip": "Điểm ăn sáng kinh điển — bánh bò nướng cốt dừa thốt nốt thơm ngọt, bán sớm hết trước 9h",
        "travel_to_next_min": 20, "travel_to_next_km": 7,
        "photo_coords": [10.3680, 105.0010]
      },
      {
        "order": 2, "name": "Đu Đủ Đâm RiNa", "commune": "Xã Châu Lăng",
        "category": "food", "time_start": "08:15", "time_end": "09:00",
        "duration_min": 45, "tip": "Ăn vặt kiểu Khmer — đu đủ non đâm cùng tôm khô, đậu phộng rang, nước chấm mắm me chua ngọt đặc trưng",
        "travel_to_next_min": 30, "travel_to_next_km": 12,
        "photo_coords": [10.4020, 104.9680]
      },
      {
        "order": 3, "name": "Quán Gà Đốt Ô Thum", "commune": "Xã Ô Lâm",
        "category": "food", "time_start": "11:00", "time_end": "12:30",
        "duration_min": 90, "tip": "Gà thả đồi ướp lá chúc + sả + nghệ, nướng than hồng — 1 con cho 2-3 người, kèm canh chua lá me + cơm",
        "travel_to_next_min": 25, "travel_to_next_km": 10,
        "photo_coords": [10.3820, 104.9880]
      },
      {
        "order": 4, "name": "Cháo Bò Lá Trúc Tri Tôn", "commune": "Thị trấn Tri Tôn",
        "category": "food", "time_start": "13:30", "time_end": "14:15",
        "duration_min": 45, "tip": "Đặc sản không đâu có — cháo bò nấu từ xương ống, ăn kèm lá trúc thơm, thêm quẩy giòn và tương hoisin",
        "travel_to_next_min": 5, "travel_to_next_km": 1,
        "photo_coords": [10.3710, 104.9980]
      },
      {
        "order": 5, "name": "Nước Thốt Nốt & Đường Thốt Nốt", "commune": "Thị trấn Tri Tôn",
        "category": "food", "time_start": "14:30", "time_end": "15:00",
        "duration_min": 30, "tip": "Mua nước thốt nốt tươi uống tại chỗ + đường thốt nốt về làm quà — đặc sản không thể thiếu khi về",
        "travel_to_next_min": 0, "travel_to_next_km": 0,
        "photo_coords": [10.3650, 104.9970]
      }
    ]
  },
  {
    "slug": "half-day",
    "emoji": "🕰️",
    "title": "Nửa Ngày Ghé Ngang",
    "tagline": "Chỉ 3-4 tiếng — vẫn đủ cảm xúc và ảnh đẹp",
    "for_whom": "Ghé ngang tiện đường, du khách ít thời gian, đoàn transit qua An Giang",
    "duration": "3.5 tiếng",
    "budget_range": "100k–200k/người",
    "sort_order": 6,
    "stops": [
      {
        "order": 1, "name": "Hồ Tà Pạ", "commune": "Xã Núi Tô",
        "category": "check-in", "time_start": "07:00", "time_end": "08:30",
        "duration_min": 90, "tip": "Điểm duy nhất mà ai ghé Tri Tôn cũng phải thấy — nước xanh + núi phản chiếu. Đậu xe ngay bờ hồ miễn phí",
        "travel_to_next_min": 5, "travel_to_next_km": 1.5,
        "photo_coords": [10.4165, 105.0042]
      },
      {
        "order": 2, "name": "Chùa Tà Pạ", "commune": "Xã Núi Tô",
        "category": "spiritual", "time_start": "08:40", "time_end": "09:15",
        "duration_min": 35, "tip": "Chỉ cách hồ 5 phút đi bộ — vào viếng nhanh, ngắm kiến trúc chùa Khmer độc đáo trên lưng núi",
        "travel_to_next_min": 20, "travel_to_next_km": 8,
        "photo_coords": [10.4178, 105.0025]
      },
      {
        "order": 3, "name": "Quán Gà Đốt Ô Thum", "commune": "Xã Ô Lâm",
        "category": "food", "time_start": "10:00", "time_end": "11:30",
        "duration_min": 90, "tip": "Ăn xong là có thể lên đường — gọi nhanh gà đốt + cơm + canh chua, phục vụ nhanh, quán rộng",
        "travel_to_next_min": 0, "travel_to_next_km": 0,
        "photo_coords": [10.3820, 104.9880]
      }
    ]
  },
  {
    "slug": "history-memorial",
    "emoji": "📜",
    "title": "Lịch Sử & Tưởng Niệm",
    "tagline": "Hành trình hiểu vùng đất — lịch sử đau thương và hồi sinh",
    "for_whom": "Người muốn tìm hiểu lịch sử kháng chiến, văn hóa Khmer và địa chí An Giang",
    "duration": "7 tiếng",
    "budget_range": "100k–200k/người",
    "sort_order": 7,
    "stops": [
      {
        "order": 1, "name": "Nhà Mồ Ba Chúc", "commune": "Xã Ba Chúc",
        "category": "history", "time_start": "07:30", "time_end": "09:00",
        "duration_min": 90, "tip": "Di tích lịch sử quốc gia — mặc đồ trang nghiêm, không chụp ảnh selfie trong khu nhà mồ, giữ thái độ tôn kính",
        "travel_to_next_min": 10, "travel_to_next_km": 3,
        "photo_coords": [10.2980, 104.9450]
      },
      {
        "order": 2, "name": "Chùa Phi Lai", "commune": "Xã Ba Chúc",
        "category": "spiritual", "time_start": "09:15", "time_end": "10:00",
        "duration_min": 45, "tip": "Ngôi chùa cổ gắn liền với phong trào Đạo Hòa Hảo — nơi hàng ngàn người dân ẩn náu năm 1978",
        "travel_to_next_min": 30, "travel_to_next_km": 12,
        "photo_coords": [10.3010, 104.9410]
      },
      {
        "order": 3, "name": "Đồi Tức Dụp (Núi Hai Vai)", "commune": "Xã An Tức",
        "category": "history", "time_start": "10:45", "time_end": "12:30",
        "duration_min": 105, "tip": "Căn cứ địa kháng chiến bí mật trong lòng núi — hệ thống hang đá 40 cửa nổi tiếng cả nước",
        "travel_to_next_min": 25, "travel_to_next_km": 10,
        "photo_coords": [10.3710, 104.9620]
      },
      {
        "order": 4, "name": "Chùa Xvayton (Xà Tón)", "commune": "Thị trấn Tri Tôn",
        "category": "spiritual", "time_start": "13:30", "time_end": "14:30",
        "duration_min": 60, "tip": "Chùa cổ nhất vùng — xem bộ Kinh Lá Buông độc bản và kiến trúc Khmer thế kỷ 17",
        "travel_to_next_min": 15, "travel_to_next_km": 5,
        "photo_coords": [10.3670, 104.9990]
      },
      {
        "order": 5, "name": "Ô Tà Sóc", "commune": "Xã Lương Phi",
        "category": "nature", "time_start": "15:00", "time_end": "16:30",
        "duration_min": 90, "tip": "Thung lũng bí ẩn từng là căn cứ kháng chiến — còn dấu tích đạn bom và hầm trú ẩn trong vách đá",
        "travel_to_next_min": 0, "travel_to_next_km": 0,
        "photo_coords": [10.3500, 104.9400]
      }
    ]
  },
  {
    "slug": "couple-chill",
    "emoji": "💑",
    "title": "Couple Chill & Hoàng Hôn",
    "tagline": "Chậm lại — cảnh đẹp, không gian riêng, khoảnh khắc hai người",
    "for_whom": "Cặp đôi muốn có chuyến đi lãng mạn, chill, chụp ảnh đôi và ngắm hoàng hôn",
    "duration": "7 tiếng",
    "budget_range": "250k–450k/người (bao gồm cà phê & ăn)",
    "sort_order": 8,
    "stops": [
      {
        "order": 1, "name": "Hồ Soài So (Soài Chek)", "commune": "Xã Ô Lâm",
        "category": "check-in", "time_start": "06:30", "time_end": "08:00",
        "duration_min": 90, "tip": "Bình minh trên hồ yên tĩnh, ít người hơn Tà Pạ — thuê thuyền nhỏ ra giữa hồ, hoàn hảo cho ảnh đôi",
        "travel_to_next_min": 25, "travel_to_next_km": 9,
        "photo_coords": [10.4050, 104.9520]
      },
      {
        "order": 2, "name": "Hồ Tà Pạ", "commune": "Xã Núi Tô",
        "category": "check-in", "time_start": "08:30", "time_end": "09:30",
        "duration_min": 60, "tip": "Chụp ảnh đôi bên bờ hồ xanh ngọc — dùng trang phục tông xanh/trắng để hòa với màu nước",
        "travel_to_next_min": 30, "travel_to_next_km": 11,
        "photo_coords": [10.4165, 105.0042]
      },
      {
        "order": 3, "name": "Cà Phê View Tà Pạ", "commune": "Xã Núi Tô",
        "category": "food", "time_start": "10:00", "time_end": "11:00",
        "duration_min": 60, "tip": "Cafe nhìn thẳng ra hồ Tà Pạ — cà phê thốt nốt đặc sản + không khí núi rừng mát lạnh buổi sáng",
        "travel_to_next_min": 30, "travel_to_next_km": 12,
        "photo_coords": [10.4170, 105.0050]
      },
      {
        "order": 4, "name": "Cổng Trời Koh Kas", "commune": "Xã Châu Lăng",
        "category": "check-in", "time_start": "11:45", "time_end": "12:30",
        "duration_min": 45, "tip": "Chụp ảnh đôi trong khung cổng đá cổ — không gian yên tĩnh, thơ mộng, ít khách vào buổi trưa",
        "travel_to_next_min": 25, "travel_to_next_km": 9,
        "photo_coords": [10.4010, 104.9620]
      },
      {
        "order": 5, "name": "Quán Gà Đốt Ô Thum", "commune": "Xã Ô Lâm",
        "category": "food", "time_start": "13:00", "time_end": "14:30",
        "duration_min": 90, "tip": "Bữa trưa lãng mạn với gà đốt + nước dừa tươi — không gian thoáng mát, phù hợp ngồi lâu chuyện trò",
        "travel_to_next_min": 25, "travel_to_next_km": 10,
        "photo_coords": [10.3820, 104.9880]
      },
      {
        "order": 6, "name": "Núi Dài (Núi Nước)", "commune": "Xã Châu Lăng",
        "category": "nature", "time_start": "16:00", "time_end": "17:30",
        "duration_min": 90, "tip": "Ngắm hoàng hôn trên đỉnh núi Dài — mặt trời lặn sau dãy Thất Sơn, ánh vàng đổ xuống đồng lúa xanh rờn",
        "travel_to_next_min": 0, "travel_to_next_km": 0,
        "photo_coords": [10.3900, 104.9750]
      }
    ]
  }
]

print(f"Seeding {len(PRESETS)} preset itineraries to Supabase...")

status = upsert_rows('preset_itineraries', PRESETS)
if status in [200, 201, 204]:
    print(f"[SUCCESS] Seeded {len(PRESETS)} preset itineraries!")
else:
    print(f"[RESULT] HTTP status: {status}")
    # Check if table needs to be created first
    print("\nTable may not exist yet. Please run the SQL migration in Supabase Dashboard:")
    print("""
CREATE TABLE IF NOT EXISTS preset_itineraries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  emoji        TEXT NOT NULL,
  title        TEXT NOT NULL,
  tagline      TEXT NOT NULL,
  for_whom     TEXT NOT NULL,
  duration     TEXT NOT NULL,
  budget_range TEXT,
  stops        JSONB NOT NULL,
  is_active    BOOLEAN DEFAULT true,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE preset_itineraries ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read preset_itineraries"
  ON preset_itineraries FOR SELECT USING (is_active = true);
""")
