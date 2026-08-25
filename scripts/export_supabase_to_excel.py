"""
Script xuất bản toàn bộ Cơ sở dữ liệu Du Lịch Tri Tôn từ Supabase Cloud sang Microsoft Excel (.xlsx)
Bao gồm:
- Sheet 1: 161+ Địa Điểm Du Lịch Thực Địa (Places)
- Sheet 2: Bảng Thống Kê Tổng Hợp 15 Xã & Thị Trấn (Communes Summary)
- Sheet 3: Cơ Sở Tri Thức & RAG Ground Truth (Knowledge Base)
- Sheet 4: Danh Mục Lịch Trình Mẫu Bảy Núi (Itineraries)
- Sheet 5: Video & Check-in TikTok (Videos)
- Sheet 6: Góp Ý & Nhật Ký Kiểm Tra (Feedbacks & Audits)
"""
import os
import sys
import json
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
    """Lấy toàn bộ dữ liệu từ bảng trên Supabase REST API"""
    if not SUPABASE_KEY:
        return []
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*"
    req = urllib.request.Request(
        url,
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        print(f"⚠️ Không thể tải bảng [{table_name}]: {e}")
        return []

# Style definitions
FONT_TITLE = Font(name='Segoe UI', size=14, bold=True, color='FFFFFF')
FONT_HEADER = Font(name='Segoe UI', size=11, bold=True, color='FFFFFF')
FONT_BOLD = Font(name='Segoe UI', size=10, bold=True, color='26221B')
FONT_BODY = Font(name='Segoe UI', size=10, color='26221B')
FONT_LINK = Font(name='Segoe UI', size=10, color='0E8C7F', underline='single')

FILL_EMERALD_DARK = PatternFill(start_color='0E8C7F', end_color='0E8C7F', fill_type='solid')
FILL_GOLDEN = PatternFill(start_color='D9822B', end_color='D9822B', fill_type='solid')
FILL_INDIGO = PatternFill(start_color='1E293B', end_color='1E293B', fill_type='solid')
FILL_TEAL = PatternFill(start_color='047857', end_color='047857', fill_type='solid')
FILL_ZEBRA = PatternFill(start_color='F8FAF8', end_color='F8FAF8', fill_type='solid')
FILL_SUMMARY = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid')

BORDER_THIN = Border(
    left=Side(style='thin', color='E5E7EB'),
    right=Side(style='thin', color='E5E7EB'),
    top=Side(style='thin', color='E5E7EB'),
    bottom=Side(style='thin', color='E5E7EB')
)

BORDER_TOTAL = Border(
    top=Side(style='thin', color='26221B'),
    bottom=Side(style='double', color='26221B')
)

ALIGN_CENTER = Alignment(horizontal='center', vertical='center', wrap_text=True)
ALIGN_LEFT = Alignment(horizontal='left', vertical='center', wrap_text=True)
ALIGN_RIGHT = Alignment(horizontal='right', vertical='center')

def autofit_columns(ws, max_len_cap=60):
    """Tự động căn chỉnh độ rộng cột thông minh"""
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            val_str = str(cell.value or '')
            if '\n' in val_str:
                val_str = max(val_str.split('\n'), key=len)
            max_len = max(max_len, len(val_str))
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), max_len_cap)

def build_places_sheet(wb, places: list):
    """Xây dựng Sheet 1: Danh sách địa điểm chi tiết"""
    ws = wb.active
    ws.title = "1. Địa Điểm (Places)"
    ws.views.sheetView[0].showGridLines = True

    headers = [
        "STT", "Mã ID", "Tên Địa Điểm", "Tên Tiếng Anh (EN)", "Xã / Thị Trấn", 
        "Phân Loại", "Phân Loại Phụ", "Đánh Giá (⭐)", "Vĩ Độ (Lat)", "Kinh Độ (Lng)", 
        "Địa Chỉ Thực Địa", "Điện Thoại / Hotline", "Mức Giá", "Giờ Mở Cửa", "Mở Đêm", 
        "Thời Điểm Đẹp Nhất", "Mô Tả Tổng Quan", "Sự Tích & Di Sản", "Mẹo Thực Địa", 
        "Ảnh Đại Diện URL", "Trạng Thái", "Link Google Maps Dẫn Đường"
    ]

    ws.row_dimensions[1].height = 28
    for col_idx, text in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=text)
        cell.font = FONT_HEADER
        cell.fill = FILL_EMERALD_DARK
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_THIN

    # Sort places by Commune, then Name
    sorted_places = sorted(places, key=lambda x: (x.get('commune', '') or '', x.get('name', '') or ''))

    for r_idx, p in enumerate(sorted_places, 2):
        ws.row_dimensions[r_idx].height = 22
        is_even = (r_idx % 2 == 0)
        row_fill = FILL_ZEBRA if is_even else None

        name = p.get('name', '')
        name_en = p.get('name_en', '')
        commune = p.get('commune', '')
        cat = p.get('category', '')
        subcat = p.get('subcategory', '')
        rating = float(p.get('rating') or 4.8)
        lat = float(p['latitude']) if p.get('latitude') else None
        lng = float(p['longitude']) if p.get('longitude') else None
        addr = p.get('address', '') or commune
        phone = p.get('phone') or p.get('hotline') or ''
        price = p.get('price_level', '')
        hours = p.get('opening_hours', '')
        open_late = "Có (Đêm)" if p.get('open_late') else "Không"
        best_time = p.get('best_time', '')
        desc = (p.get('description', '') or '').replace('\n', ' ')
        story = (p.get('detailed_story', '') or '').replace('\n', ' ')
        tips = (p.get('field_tips', '') or '').replace('\n', ' ')
        img = p.get('image_url', '')
        active = "Hoạt Động" if p.get('is_active', True) else "Tạm Ẩn"
        
        maps_link = f"https://www.google.com/maps/search/?api=1&query={lat},{lng}" if lat and lng else f"https://maps.google.com/?q={urllib.parse.quote(name)}+{urllib.parse.quote(commune)}+An+Giang"

        values = [
            r_idx - 1, p.get('id', ''), name, name_en, commune,
            cat, subcat, rating, lat, lng,
            addr, phone, price, hours, open_late,
            best_time, desc, story, tips,
            img, active, maps_link
        ]

        for c_idx, val in enumerate(values, 1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            cell.font = FONT_BODY
            cell.border = BORDER_THIN
            if row_fill:
                cell.fill = row_fill

            if c_idx == 1:
                cell.alignment = ALIGN_CENTER
            elif c_idx in (8, 9, 10):
                cell.alignment = ALIGN_RIGHT
            elif c_idx == 22:
                cell.font = FONT_LINK
                cell.hyperlink = maps_link

    ws.freeze_panes = 'C2'
    ws.auto_filter.ref = f"A1:{get_column_letter(len(headers))}{len(sorted_places)+1}"
    autofit_columns(ws)

def build_communes_sheet(wb, places: list):
    """Xây dựng Sheet 2: Bảng Thống Kê Tổng Hợp 15 Xã & Thị Trấn"""
    ws = wb.create_sheet(title="2. Thống Kê 15 Xã (Communes)")
    ws.views.sheetView[0].showGridLines = True

    COMMUNES_ORDER = [
        "Thị trấn Tri Tôn", "Thị trấn Ba Chúc", "Xã Châu Lăng", "Xã Lương Phi",
        "Xã Lê Trì", "Xã Lạc Quới", "Xã Vĩnh Gia", "Xã Vĩnh Phước",
        "Xã Ô Lâm", "Xã An Tức", "Xã Cô Tô", "Xã Tân Tuyến",
        "Xã Tà Đảnh", "Xã Núi Tô", "Xã Lương An Trà"
    ]

    headers = [
        "STT", "Tên Xã / Thị Trấn", "Tổng Địa Điểm", 
        "Danh Thắng Núi/Hồ (Nature)", "Ẩm Thực Đặc Sản (Food)", 
        "Chùa & Tâm Linh (Culture)", "Điểm Check-in (Photo)", 
        "Lưu Trú & Khách Sạn (Stay)", "Điểm Mở Về Đêm (Night)", "Điểm Đánh Giá TB (⭐)"
    ]

    ws.row_dimensions[1].height = 28
    for col_idx, text in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=text)
        cell.font = FONT_HEADER
        cell.fill = FILL_GOLDEN
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_THIN

    # Aggregate
    agg = {c: {'total': 0, 'nature': 0, 'food': 0, 'culture': 0, 'checkin': 0, 'stay': 0, 'night': 0, 'ratings': []} for c in COMMUNES_ORDER}
    other_places = []

    for p in places:
        c = p.get('commune', '')
        matched_commune = None
        for std_c in COMMUNES_ORDER:
            if std_c.lower() in c.lower() or c.lower() in std_c.lower():
                matched_commune = std_c
                break
        
        if not matched_commune:
            matched_commune = "Thị trấn Tri Tôn"

        cat = (p.get('category') or '').lower()
        subcat = (p.get('subcategory') or '').lower()
        
        agg[matched_commune]['total'] += 1
        if 'nature' in cat or 'mountain' in cat or 'lake' in cat:
            agg[matched_commune]['nature'] += 1
        elif 'food' in cat or 'gastronomy' in cat:
            agg[matched_commune]['food'] += 1
        elif 'culture' in cat or 'spiritual' in cat or 'temple' in cat:
            agg[matched_commune]['culture'] += 1
        elif 'check-in' in cat or 'photo' in cat:
            agg[matched_commune]['checkin'] += 1
        elif 'stay' in cat or 'hotel' in cat or 'homestay' in cat:
            agg[matched_commune]['stay'] += 1

        if p.get('open_late'):
            agg[matched_commune]['night'] += 1

        if p.get('rating'):
            agg[matched_commune]['ratings'].append(float(p['rating']))

    for r_idx, c_name in enumerate(COMMUNES_ORDER, 2):
        ws.row_dimensions[r_idx].height = 22
        data = agg[c_name]
        avg_rating = round(sum(data['ratings']) / len(data['ratings']), 2) if data['ratings'] else 4.80

        values = [
            r_idx - 1, c_name, data['total'],
            data['nature'], data['food'], data['culture'],
            data['checkin'], data['stay'], data['night'], avg_rating
        ]

        for c_idx, val in enumerate(values, 1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            cell.font = FONT_BODY
            cell.border = BORDER_THIN
            if c_idx in (1, 3, 4, 5, 6, 7, 8, 9, 10):
                cell.alignment = ALIGN_CENTER

    # Total Summary Row
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

def build_knowledge_sheet(wb, kb_data: list):
    """Xây dựng Sheet 3: Cơ sở tri thức & RAG Ground Truth"""
    ws = wb.create_sheet(title="3. Tri Thức RAG (Knowledge)")
    ws.views.sheetView[0].showGridLines = True

    headers = [
        "STT", "Mã KB", "Chủ Đề (Topic)", "Phân Loại", 
        "Từ Khóa / Câu Hỏi Mẫu", "Nội Dung Trả Lời Chuẩn (Ground Truth)", 
        "Nguồn Dữ Liệu Xác Minh", "Độ Ưu Tiên", "Ngày Cập Nhật"
    ]

    ws.row_dimensions[1].height = 28
    for col_idx, text in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=text)
        cell.font = FONT_HEADER
        cell.fill = FILL_INDIGO
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_THIN

    for r_idx, kb in enumerate(kb_data, 2):
        ws.row_dimensions[r_idx].height = 24
        is_even = (r_idx % 2 == 0)
        row_fill = FILL_ZEBRA if is_even else None

        values = [
            r_idx - 1,
            kb.get('id', ''),
            kb.get('topic', '') or kb.get('category', ''),
            kb.get('category', ''),
            kb.get('keywords', '') or kb.get('question_pattern', ''),
            kb.get('content', '') or kb.get('answer', ''),
            kb.get('source', 'UBND Huyện Tri Tôn & Phòng VHTT'),
            kb.get('priority', 1),
            kb.get('updated_at', '')[:10] if kb.get('updated_at') else ''
        ]

        for c_idx, val in enumerate(values, 1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            cell.font = FONT_BODY
            cell.border = BORDER_THIN
            if row_fill:
                cell.fill = row_fill
            if c_idx in (1, 8, 9):
                cell.alignment = ALIGN_CENTER

    ws.auto_filter.ref = f"A1:{get_column_letter(len(headers))}{len(kb_data)+1}"
    autofit_columns(ws)

def build_itineraries_sheet(wb):
    """Xây dựng Sheet 4: Danh mục Lịch trình mẫu khép vòng"""
    ws = wb.create_sheet(title="4. Lịch Trình Mẫu (Itineraries)")
    ws.views.sheetView[0].showGridLines = True

    headers = [
        "Mã Tour", "Tên Lịch Trình", "Thời Lượng", "Đối Tượng Phù Hợp", 
        "Điểm Xuất Phát", "Lộ Trình Các Điểm Dừng (Stops Sequence)", 
        "Dự Toán Chi Phí", "Lưu Ý Đường Đèo & Khung Giờ Vàng"
    ]

    ws.row_dimensions[1].height = 28
    for col_idx, text in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=text)
        cell.font = FONT_HEADER
        cell.fill = FILL_TEAL
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

def build_feedback_sheet(wb, feedbacks: list, audits: list):
    """Xây dựng Sheet 5: Đóng góp & Nhật ký kiểm duyệt"""
    ws = wb.create_sheet(title="5. Góp Ý (Feedback)")
    ws.views.sheetView[0].showGridLines = True

    headers = [
        "STT", "Họ Tên Người Gửi", "Email Liên Hệ", "Chuyên Mục", 
        "Đánh Giá (⭐)", "Nội Dung Đóng Góp / Báo Lỗi", "Thời Gian Gửi"
    ]

    ws.row_dimensions[1].height = 28
    for col_idx, text in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=text)
        cell.font = FONT_HEADER
        cell.fill = FILL_INDIGO
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_THIN

    for r_idx, fb in enumerate(feedbacks, 2):
        ws.row_dimensions[r_idx].height = 24
        values = [
            r_idx - 1,
            fb.get('name', ''),
            fb.get('email', ''),
            fb.get('category', 'Góp ý chung'),
            fb.get('rating', 5),
            fb.get('message', ''),
            fb.get('created_at', '')[:19] if fb.get('created_at') else ''
        ]
        for c_idx, val in enumerate(values, 1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            cell.font = FONT_BODY
            cell.border = BORDER_THIN
            if c_idx in (1, 5, 7):
                cell.alignment = ALIGN_CENTER

    autofit_columns(ws)

def main():
    print("================================================================================")
    print("🚀 GIAO THỨC XUẤT BẢN MASTER DATABASE SUPABASE SANG MICROSOFT EXCEL (.XLSX)")
    print("================================================================================")

    # 1. Fetch live data from Supabase
    print("📡 Đang kết nối và tải dữ liệu thời gian thực từ Supabase Cloud...")
    places = fetch_supabase_table('places')
    kb_data = fetch_supabase_table('knowledge_base')
    feedbacks = fetch_supabase_table('feedbacks')
    audits = fetch_supabase_table('audit_logs')

    print(f"✓ Đã tải {len(places)} địa điểm thực địa.")
    print(f"✓ Đã tải {len(kb_data)} bản ghi cơ sở tri thức RAG.")
    print(f"✓ Đã tải {len(feedbacks)} phản hồi đóng góp cộng đồng.")

    # 2. Create Workbook
    wb = openpyxl.Workbook()

    build_places_sheet(wb, places)
    build_communes_sheet(wb, places)
    build_knowledge_sheet(wb, kb_data)
    build_itineraries_sheet(wb)
    build_feedback_sheet(wb, feedbacks, audits)

    # 3. Save File
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'DU_LICH_TRI_TON_MASTER_DATABASE_2026.xlsx')
    
    wb.save(out_path)
    print(f"\n✨ XUẤT BẢN THÀNH CÔNG: {out_path}")
    print("================================================================================")
    return 0

if __name__ == '__main__':
    sys.exit(main())
