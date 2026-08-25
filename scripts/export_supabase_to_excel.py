"""
Script xuất bản CSDL Du Lịch Tri Tôn sang Microsoft Excel (.xlsx) PHÂN NHÓM CHUYÊN NGHIỆP:
- Sheet 1: 📑 Tổng Hợp Phân Nhóm (Gom chung từng khối: Chùa, Ẩm Thực, Danh Thắng, Check-in, Cà phê, Lưu trú)
- Sheet 2: 🏛️ Chùa Khmer & Di Tích (Danh sách chuyên biệt)
- Sheet 3: 🍲 Ẩm Thực & Quán Ăn (Danh sách chuyên biệt)
- Sheet 4: 🏞️ Danh Thắng Núi & Hồ (Danh sách chuyên biệt)
- Sheet 5: 📸 Điểm Check-in & Sống Ảo (Danh sách chuyên biệt)
- Sheet 6: ☕ Cà Phê & Điểm Đến Đêm (Danh sách chuyên biệt)
- Sheet 7: 🏡 Lưu Trú & Homestay (Danh sách chuyên biệt)
- Sheet 8: 📊 Thống Kê 15 Xã & Thị Trấn (Pivot Summary)
- Sheet 9: 🗺️ Lịch Trình Tour Mẫu (Itineraries)
"""
import os
import sys
import json
import re
import urllib.request
import urllib.parse
from dotenv import load_dotenv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
if os.path.exists(env_path):
    load_dotenv(env_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://knmlbwsmfljlabhvqfid.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

def fetch_supabase_table(table_name: str) -> list:
    """Lấy toàn bộ dữ liệu từ bảng trên Supabase REST API với retry & fallback JSON"""
    if SUPABASE_KEY:
        url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*"
        req = urllib.request.Request(
            url,
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            }
        )
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=15) as res:
                    data = json.loads(res.read().decode('utf-8'))
                    if data:
                        return data
            except Exception as e:
                print(f"⚠️ Thử tải Supabase lần {attempt+1}/3 thất bại: {e}")

    # Fallback to local clean JSON if network unreachable
    if table_name == 'places':
        local_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data', 'triton_pois_full.json')
        if os.path.exists(local_path):
            print(f"📦 Đang nạp từ CSDL Master cục bộ: {local_path}")
            with open(local_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    return []

def strip_markdown(text: str) -> str:
    """Làm sạch toàn bộ ký tự markdown"""
    if not text or not isinstance(text, str):
        return ''
    text = re.sub(r'#{1,6}\s*', '', text)
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text, flags=re.DOTALL)
    text = re.sub(r'__(.*?)__', r'\1', text, flags=re.DOTALL)
    text = re.sub(r'^\s*[\*\-\+]\s+', '• ', text, flags=re.MULTILINE)
    text = re.sub(r'(?<!\w)\*([^\*\n]+)\*(?!\w)', r'\1', text)
    text = re.sub(r'(?<!\w)_([^_\n]+)_(?!\w)', r'\1', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    text = text.replace('**', '').replace('##', '').replace('###', '').replace('####', '')
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

# Typography & Color Palettes
FONT_GROUP_BANNER = Font(name='Segoe UI', size=13, bold=True, color='FFFFFF')
FONT_HEADER = Font(name='Segoe UI', size=10, bold=True, color='FFFFFF')
FONT_BOLD = Font(name='Segoe UI', size=9, bold=True, color='26221B')
FONT_BODY = Font(name='Segoe UI', size=9, color='26221B')
FONT_LINK = Font(name='Segoe UI', size=9, color='0E8C7F', underline='single')

FILL_BANNER_CHUA = PatternFill(start_color='6366F1', end_color='6366F1', fill_type='solid') # Indigo
FILL_BANNER_FOOD = PatternFill(start_color='D9822B', end_color='D9822B', fill_type='solid') # Amber
FILL_BANNER_NATURE = PatternFill(start_color='0E8C7F', end_color='0E8C7F', fill_type='solid') # Emerald
FILL_BANNER_CHECKIN = PatternFill(start_color='EC4899', end_color='EC4899', fill_type='solid') # Pink
FILL_BANNER_CAFE = PatternFill(start_color='8B5CF6', end_color='8B5CF6', fill_type='solid') # Purple
FILL_BANNER_STAY = PatternFill(start_color='0284C7', end_color='0284C7', fill_type='solid') # Sky Blue

FILL_HEADER_DEFAULT = PatternFill(start_color='1E293B', end_color='1E293B', fill_type='solid') # Slate Dark
FILL_ZEBRA = PatternFill(start_color='F8FAF8', end_color='F8FAF8', fill_type='solid')
FILL_SUMMARY = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid')

BORDER_THIN = Border(
    left=Side(style='thin', color='E2E8F0'),
    right=Side(style='thin', color='E2E8F0'),
    top=Side(style='thin', color='E2E8F0'),
    bottom=Side(style='thin', color='E2E8F0')
)

BORDER_TOTAL = Border(
    top=Side(style='thin', color='26221B'),
    bottom=Side(style='double', color='26221B')
)

ALIGN_CENTER = Alignment(horizontal='center', vertical='center', wrap_text=True)
ALIGN_LEFT = Alignment(horizontal='left', vertical='center', wrap_text=True)
ALIGN_RIGHT = Alignment(horizontal='right', vertical='center')

def autofit_columns(ws, max_len_cap=55):
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            val_str = str(cell.value or '')
            if '\n' in val_str:
                val_str = max(val_str.split('\n'), key=len)
            max_len = max(max_len, len(val_str))
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 11), max_len_cap)

def classify_places(places: list) -> dict:
    """Phân loại 161 POIs thành 6 nhóm nghiệp vụ chuẩn"""
    buckets = {
        'chua': {'title': 'I. CHÙA KHMER & DI TÍCH LỊCH SỬ', 'icon': '🏛️', 'fill': FILL_BANNER_CHUA, 'items': []},
        'food': {'title': 'II. ẨM THỰC & QUÁN ĂN ĐẶC SẢN', 'icon': '🍲', 'fill': FILL_BANNER_FOOD, 'items': []},
        'nature': {'title': 'III. DANH THẮNG THIÊN NHIÊN, NÚI & HỒ NƯỚC', 'icon': '🏞️', 'fill': FILL_BANNER_NATURE, 'items': []},
        'checkin': {'title': 'IV. ĐIỂM CHECK-IN & CẢNH QUAN NỔI BẬT', 'icon': '📸', 'fill': FILL_BANNER_CHECKIN, 'items': []},
        'cafe': {'title': 'V. CÀ PHÊ VIEW ĐẸP & ĐIỂM ĐẾN VỀ ĐÊM', 'icon': '☕', 'fill': FILL_BANNER_CAFE, 'items': []},
        'stay': {'title': 'VI. LƯU TRÚ, HOMESTAY & KHÁCH SẠN', 'icon': '🏡', 'fill': FILL_BANNER_STAY, 'items': []},
    }

    for p in places:
        name = (p.get('name') or '').lower()
        cat = (p.get('category') or '').lower()
        subcat = (p.get('subcategory') or '').lower()
        tcat = (p.get('tourism_category') or '').lower()

        if 'stay' in cat or 'hotel' in cat or 'homestay' in cat or 'lưu trú' in tcat or 'khách sạn' in name or 'nhà nghỉ' in name:
            buckets['stay']['items'].append(p)
        elif 'cafe' in subcat or 'cà phê' in name or 'coffee' in name or 'chợ đêm' in name:
            buckets['cafe']['items'].append(p)
        elif 'chùa' in name or 'wat ' in name or 'chưn-kôm' in name or 'svay ton' in name or 'di tích' in name or 'nhà mồ' in name or 'ô tà sóc' in name or 'tức dụp' in name or 'history' in cat or 'spiritual' in cat:
            buckets['chua']['items'].append(p)
        elif 'check-in' in cat or 'cổng trời' in name or 'thốt nốt trái tim' in name or 'cầu gỗ' in name or 'vồ hội' in name or 'cánh đồng lúa' in name:
            buckets['checkin']['items'].append(p)
        elif 'gà đốt' in name or 'cháo bò' in name or 'bún cá' in name or 'bò 7 món' in name or 'đu đủ đâm' in name or 'bánh bò' in name or 'quán' in name or 'lẩu' in name or 'food' in cat or 'gastronomy' in cat:
            buckets['food']['items'].append(p)
        else:
            buckets['nature']['items'].append(p)

    # Sort items within each bucket by Commune, then Name
    for k in buckets:
        buckets[k]['items'].sort(key=lambda x: (x.get('commune', '') or '', x.get('name', '') or ''))

    return buckets

TABLE_HEADERS = [
    "STT", "Mã ID", "Tên Địa Điểm", "Tên Tiếng Anh (EN)", "Xã / Thị Trấn", 
    "Phân Loại Phụ", "Đánh Giá (⭐)", "Tọa Độ GPS (Lat, Lng)", "Địa Chỉ Thực Địa", 
    "Điện Thoại / Hotline", "Mức Giá", "Giờ Mở Cửa / Giờ Vàng", "Mô Tả Tổng Quan", 
    "Sự Tích & Di Sản Thực Địa", "Mẹo Thực Địa", "Link Google Maps Dẫn Đường"
]

def write_place_rows(ws, places: list, start_row: int, base_stt: int = 1) -> int:
    """Ghi danh sách địa điểm vào sheet"""
    current_row = start_row
    for idx, p in enumerate(places, base_stt):
        ws.row_dimensions[current_row].height = 24
        is_even = (idx % 2 == 0)
        row_fill = FILL_ZEBRA if is_even else None

        name = p.get('name', '')
        name_en = p.get('name_en', '')
        commune = p.get('commune', '')
        subcat = p.get('subcategory', '')
        rating = float(p.get('rating') or 4.8)
        lat = float(p['latitude']) if p.get('latitude') else None
        lng = float(p['longitude']) if p.get('longitude') else None
        gps_str = f"{lat}, {lng}" if lat and lng else "Đang cập nhật"
        addr = p.get('address', '') or commune
        phone = p.get('phone') or p.get('hotline') or ''
        price = p.get('price_level', '')
        hours = p.get('opening_hours', '') or p.get('best_time', '')
        desc = strip_markdown(p.get('description', '')).replace('\n', ' ')
        story = strip_markdown(p.get('detailed_story', '')).replace('\n', ' ')
        tips = strip_markdown(p.get('field_tips', '')).replace('\n', ' ')
        
        maps_link = f"https://www.google.com/maps/search/?api=1&query={lat},{lng}" if lat and lng else f"https://maps.google.com/?q={urllib.parse.quote(name)}+{urllib.parse.quote(commune)}+An+Giang"

        values = [
            idx, p.get('id', ''), name, name_en, commune,
            subcat, rating, gps_str, addr, phone,
            price, hours, desc, story, tips, maps_link
        ]

        for c_idx, val in enumerate(values, 1):
            cell = ws.cell(row=current_row, column=c_idx, value=val)
            cell.font = FONT_BODY
            cell.border = BORDER_THIN
            if row_fill:
                cell.fill = row_fill

            if c_idx in (1, 7, 8):
                cell.alignment = ALIGN_CENTER
            elif c_idx == 16:
                cell.font = FONT_LINK
                cell.hyperlink = maps_link

        current_row += 1
    return current_row

def build_grouped_master_sheet(wb, buckets: dict):
    """Sheet 1: Toàn bộ địa điểm gom chung thành từng khối nhóm có banner lớn"""
    ws = wb.active
    ws.title = "1. 📑 Tổng Hợp Phân Nhóm"
    ws.views.sheetView[0].showGridLines = True

    current_row = 1

    for k, b in buckets.items():
        items = b['items']
        if not items:
            continue

        # 🌟 GROUP BANNER ROW 🌟
        ws.row_dimensions[current_row].height = 32
        ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=len(TABLE_HEADERS))
        banner_cell = ws.cell(row=current_row, column=1, value=f"{b['icon']} {b['title']} — TỔNG SỐ: {len(items)} ĐỊA ĐIỂM")
        banner_cell.font = FONT_GROUP_BANNER
        banner_cell.fill = b['fill']
        banner_cell.alignment = Alignment(horizontal='left', vertical='center', indent=1)

        current_row += 1

        # Table Header Row
        ws.row_dimensions[current_row].height = 24
        for col_idx, text in enumerate(TABLE_HEADERS, 1):
            cell = ws.cell(row=current_row, column=col_idx, value=text)
            cell.font = FONT_HEADER
            cell.fill = FILL_HEADER_DEFAULT
            cell.alignment = ALIGN_CENTER
            cell.border = BORDER_THIN

        current_row += 1

        # Place Rows
        current_row = write_place_rows(ws, items, current_row, base_stt=1)

        # Empty Spacer Row
        current_row += 1

    ws.freeze_panes = 'D2'
    autofit_columns(ws)

def build_single_category_sheet(wb, title: str, icon: str, banner_fill, items: list):
    """Tạo sheet chuyên biệt riêng cho 1 nhóm địa điểm"""
    ws = wb.create_sheet(title=title)
    ws.views.sheetView[0].showGridLines = True

    # 🌟 TOP BANNER 🌟
    ws.row_dimensions[1].height = 32
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(TABLE_HEADERS))
    banner_cell = ws.cell(row=1, column=1, value=f"{icon} DANH SÁCH CHI TIẾT: {title.upper()} ({len(items)} ĐỊA ĐIỂM)")
    banner_cell.font = FONT_GROUP_BANNER
    banner_cell.fill = banner_fill
    banner_cell.alignment = Alignment(horizontal='left', vertical='center', indent=1)

    # Table Header Row
    ws.row_dimensions[2].height = 24
    for col_idx, text in enumerate(TABLE_HEADERS, 1):
        cell = ws.cell(row=2, column=col_idx, value=text)
        cell.font = FONT_HEADER
        cell.fill = FILL_HEADER_DEFAULT
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_THIN

    # Place Rows
    write_place_rows(ws, items, start_row=3, base_stt=1)

    ws.freeze_panes = 'D3'
    ws.auto_filter.ref = f"A2:{get_column_letter(len(TABLE_HEADERS))}{len(items)+2}"
    autofit_columns(ws)

def build_communes_sheet(wb, places: list):
    """Sheet Thống Kê 15 Xã & Thị Trấn"""
    ws = wb.create_sheet(title="📊 Thống Kê 15 Xã")
    ws.views.sheetView[0].showGridLines = True

    COMMUNES_ORDER = [
        "Thị trấn Tri Tôn", "Thị trấn Ba Chúc", "Xã Châu Lăng", "Xã Lương Phi",
        "Xã Lê Trì", "Xã Lạc Quới", "Xã Vĩnh Gia", "Xã Vĩnh Phước",
        "Xã Ô Lâm", "Xã An Tức", "Xã Cô Tô", "Xã Tân Tuyến",
        "Xã Tà Đảnh", "Xã Núi Tô", "Xã Lương An Trà"
    ]

    headers = [
        "STT", "Tên Xã / Thị Trấn", "Tổng Địa Điểm", 
        "Chùa & Tâm Linh", "Ẩm Thực Đặc Sản", "Danh Thắng Núi/Hồ", 
        "Điểm Check-in", "Cà Phê & Đêm", "Lưu Trú & Homestay", "Điểm Đánh Giá TB (⭐)"
    ]

    ws.row_dimensions[1].height = 28
    for col_idx, text in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=text)
        cell.font = FONT_HEADER
        cell.fill = FILL_BANNER_FOOD
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_THIN

    # Aggregate
    agg = {c: {'total': 0, 'chua': 0, 'food': 0, 'nature': 0, 'checkin': 0, 'cafe': 0, 'stay': 0, 'ratings': []} for c in COMMUNES_ORDER}

    for p in places:
        c = p.get('commune', '')
        matched = "Thị trấn Tri Tôn"
        for std_c in COMMUNES_ORDER:
            if std_c.lower() in c.lower() or c.lower() in std_c.lower():
                matched = std_c
                break

        name = (p.get('name') or '').lower()
        cat = (p.get('category') or '').lower()
        subcat = (p.get('subcategory') or '').lower()

        agg[matched]['total'] += 1
        if 'chùa' in name or 'wat ' in name or 'di tích' in name or 'nhà mồ' in name or 'culture' in cat or 'spiritual' in cat:
            agg[matched]['chua'] += 1
        elif 'gà đốt' in name or 'cháo bò' in name or 'bún cá' in name or 'bò 7 món' in name or 'food' in cat or 'gastronomy' in cat:
            agg[matched]['food'] += 1
        elif 'cafe' in subcat or 'cà phê' in name or 'chợ đêm' in name:
            agg[matched]['cafe'] += 1
        elif 'stay' in cat or 'hotel' in cat or 'homestay' in cat or 'khách sạn' in name:
            agg[matched]['stay'] += 1
        elif 'check-in' in cat or 'cổng trời' in name or 'thốt nốt trái tim' in name:
            agg[matched]['checkin'] += 1
        else:
            agg[matched]['nature'] += 1

        if p.get('rating'):
            agg[matched]['ratings'].append(float(p['rating']))

    for r_idx, c_name in enumerate(COMMUNES_ORDER, 2):
        ws.row_dimensions[r_idx].height = 22
        data = agg[c_name]
        avg_rating = round(sum(data['ratings']) / len(data['ratings']), 2) if data['ratings'] else 4.80

        values = [
            r_idx - 1, c_name, data['total'],
            data['chua'], data['food'], data['nature'],
            data['checkin'], data['cafe'], data['stay'], avg_rating
        ]

        for c_idx, val in enumerate(values, 1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            cell.font = FONT_BODY
            cell.border = BORDER_THIN
            if c_idx in (1, 3, 4, 5, 6, 7, 8, 9, 10):
                cell.alignment = ALIGN_CENTER

    # Total Row
    tot_row = len(COMMUNES_ORDER) + 2
    ws.row_dimensions[tot_row].height = 24
    ws.cell(row=tot_row, column=1, value="")
    ws.cell(row=tot_row, column=2, value="TỔNG CỘNG TOÀN HUYỆN").font = FONT_BOLD

    for c_idx in range(3, 10):
        col_let = get_column_letter(c_idx)
        cell = ws.cell(row=tot_row, column=c_idx)
        cell.value = f"=SUM({col_let}2:{col_let}{tot_row-1})"
        cell.font = FONT_BOLD
        cell.fill = FILL_SUMMARY
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_TOTAL

    cell_avg = ws.cell(row=tot_row, column=10)
    cell_avg.value = f"=AVERAGE(J2:J{tot_row-1})"
    cell_avg.font = FONT_BOLD
    cell_avg.fill = FILL_SUMMARY
    cell_avg.alignment = ALIGN_CENTER
    cell_avg.border = BORDER_TOTAL
    cell_avg.number_format = '0.00'

    autofit_columns(ws)

def build_itineraries_sheet(wb):
    """Sheet Lịch Trình Tour Mẫu"""
    ws = wb.create_sheet(title="🗺️ Lịch Trình Mẫu")
    ws.views.sheetView[0].showGridLines = True

    headers = [
        "Mã Tour", "Tên Lịch Trình", "Thời Lượng", "Đối Tượng Phù Hợp", 
        "Điểm Xuất Phát", "Lộ Trình Các Điểm Dừng (Stops Sequence)", 
        "Dự Toán Chi Phí", "Lưu Ý Cung Đường & Giờ Vàng"
    ]

    ws.row_dimensions[1].height = 28
    for col_idx, text in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=text)
        cell.font = FONT_HEADER
        cell.fill = FILL_BANNER_NATURE
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_THIN

    itineraries = [
        [
            "TOUR-1D-01", "Tour 1 Ngày: Tinh Hoa Thất Sơn (Tà Pạ – Ô Thum – Tức Dụp)", "1 Ngày (07:00 – 17:30)", "Gia đình, Bạn trẻ, Nhóm phượt",
            "Trung tâm TT Tri Tôn",
            "1. Ăn sáng Cháo bò Tri Tôn ➔ 2. Hồ Tà Pạ & Chùa Tà Pạ ➔ 3. Hàng thốt nốt trái tim ➔ 4. Trưa ăn Gà Đốt lá chúc Ô Thum ➔ 5. Khám phá Di tích Đồi Tức Dụp ➔ 6. Chiều ngắm hoàng hôn Cổng trời Koh Kas",
            "~350.000đ – 500.000đ / người",
            "Nên đặt gà đốt Ô Thum trước 45 phút. Buổi chiều ghé Cổng trời Koh Kas lúc 16:30 đón hoàng hôn đẹp nhất."
        ],
        [
            "TOUR-2D1N-01", "Tour 2N1Đ: Săn Mây Cô Tô – Cung Đường Tâm Linh & Ẩm Thực Bảy Núi", "2 Ngày 1 Đêm", "Phượt thủ, Nhiếp ảnh, Cặp đôi",
            "Bến xe Tri Tôn",
            "Ngày 1: Hồ Soài So ➔ Trekking Núi Cô Tô & Ngủ đêm săn mây Đá Vồ Hội\nNgày 2: Xuống núi ăn Bún cá Châu Lăng ➔ Viếng Chùa Svay Ton ➔ Nhà Mồ Ba Chúc ➔ Ăn Bò 7 Món",
            "~800.000đ – 1.200.000đ / người",
            "Đường lên đỉnh Cô Tô dốc >18%, tuyệt đối không đi xe ga; khuyên dùng xe ôm 2 phanh phụ bản địa hoặc đi bộ trekking."
        ],
        [
            "TOUR-3D2N-01", "Tour 3N2Đ: Toàn Cảnh Huyền Bí Tri Tôn & Vùng Biên Giới Thất Sơn", "3 Ngày 2 Đêm", "Đoàn du lịch, Gia đình, Du khách phương xa",
            "TP. Long Xuyên / Châu Đốc",
            "Ngày 1: Hồ Latina ➔ Cổng Trời Koh Kas ➔ Hồ Tà Pạ ➔ Chợ Đêm Tri Tôn\nNgày 2: Núi Cô Tô ➔ Hồ Soài So ➔ Hồ Ô Thum ➔ Đồi Tức Dụp\nNgày 3: Căn cứ Ô Tà Sóc ➔ Quần thể Di tích Ba Chúc ➔ Cửa khẩu Vĩnh Gia",
            "~1.500.000đ – 2.200.000đ / người",
            "Cần chuẩn bị giày thể thao leo núi bám đá, kem chống muỗi khi luồn hang Tức Dụp và Ô Tà Sóc."
        ],
        [
            "TOUR-CULTURE-01", "Hành Trình Khám Phá Di Sản 37 Chùa Khmer & Nghệ Thuật Chép Kinh Lá Buông", "1 Ngày (08:00 – 16:30)", "Tâm linh, Nghiên cứu văn hóa",
            "Chùa Xà Tón (TT Tri Tôn)",
            "1. Chùa Xà Tón (Svay Ton) ➔ 2. Chùa Tà Pạ (Chưn-Kôm) ➔ 3. Chùa Tà Miệt (Kiri Champa) ➔ 4. Chùa Sà Lôn (Chùa Chén Kiểu) ➔ 5. Chùa Kirivong Ô Lâm",
            "~250.000đ – 400.000đ / người",
            "Tuân thủ nghiêm ngặt quy tắc trang phục kín đáo qua gối, bỏ dép trước khi vào Chánh điện Sima, chào Sampheah chuẩn mực."
        ]
    ]

    for r_idx, it in enumerate(itineraries, 2):
        ws.row_dimensions[r_idx].height = 45
        is_even = (r_idx % 2 == 0)
        row_fill = FILL_ZEBRA if is_even else None

        for c_idx, val in enumerate(it, 1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            cell.font = FONT_BODY
            cell.border = BORDER_THIN
            if row_fill:
                cell.fill = row_fill
            if c_idx in (1, 3):
                cell.alignment = ALIGN_CENTER
            else:
                cell.alignment = ALIGN_LEFT

    autofit_columns(ws)

def main():
    print("================================================================================")
    print("🚀 GIAO THỨC XUẤT BẢN FILE EXCEL PHÂN NHÓM CHUYÊN NGHIỆP TỪ SUPABASE CLOUD")
    print("================================================================================")

    print("📡 Đang kết nối và tải dữ liệu từ Supabase Cloud...")
    places = fetch_supabase_table('places')
    print(f"✓ Đã tải {len(places)} địa điểm.")

    # Classify into 6 distinct buckets
    buckets = classify_places(places)

    wb = openpyxl.Workbook()

    # 1. Sheet 1: Master Grouped (Gom khối)
    build_grouped_master_sheet(wb, buckets)

    # 2. Dedicated Category Sheets
    build_single_category_sheet(wb, "🏛️ Chùa & Di Tích", "🏛️", FILL_BANNER_CHUA, buckets['chua']['items'])
    build_single_category_sheet(wb, "🍲 Ẩm Thực Đặc Sản", "🍲", FILL_BANNER_FOOD, buckets['food']['items'])
    build_single_category_sheet(wb, "🏞️ Danh Thắng Núi Hồ", "🏞️", FILL_BANNER_NATURE, buckets['nature']['items'])
    build_single_category_sheet(wb, "📸 Điểm Check-in", "📸", FILL_BANNER_CHECKIN, buckets['checkin']['items'])
    build_single_category_sheet(wb, "☕ Cà Phê & Đêm", "☕", FILL_BANNER_CAFE, buckets['cafe']['items'])
    build_single_category_sheet(wb, "🏡 Lưu Trú Homestay", "🏡", FILL_BANNER_STAY, buckets['stay']['items'])

    # 3. Summary & Itinerary Sheets
    build_communes_sheet(wb, places)
    build_itineraries_sheet(wb)

    out_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path_1 = os.path.join(out_dir, 'DU_LICH_TRI_TON_MASTER_DATABASE_2026.xlsx')
    out_path_2 = os.path.join(out_dir, 'DU_LICH_TRI_TON_PHAN_NHOM_2026.xlsx')
    
    wb.save(out_path_1)
    wb.save(out_path_2)
    print(f"\n✨ XUẤT BẢN THÀNH CÔNG TẠI WORKSPACE:")
    print(f"  1. {out_path_1}")
    print(f"  2. {out_path_2}")

    # Copy to Downloads
    dst_dir = os.path.expanduser(r'~\Downloads')
    import shutil
    for src_p, name in [(out_path_2, 'DU_LICH_TRI_TON_PHAN_NHOM_2026.xlsx'), (out_path_1, 'DU_LICH_TRI_TON_MASTER_DATABASE_2026.xlsx')]:
        dst_p = os.path.join(dst_dir, name)
        try:
            shutil.copy2(src_p, dst_p)
            print(f"  ✓ Đã copy sang: {dst_p}")
        except PermissionError:
            print(f"  ⚠️ Tệp {name} đang được mở trong Excel, vui lòng đóng lại nếu muốn ghi đè!")
        except Exception as e:
            print(f"  ⚠️ Lỗi khi copy {name}: {e}")

    return 0

if __name__ == '__main__':
    sys.exit(main())
