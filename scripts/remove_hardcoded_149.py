"""
Script rà soát và thay thế toàn bộ chuỗi hardcode '149 địa điểm' / '149 POIs' thành ngôn từ động, chuẩn xác và không cố định số lượng theo đúng chỉ đạo của người dùng.
"""
import os
import sys
import re

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

REPLACEMENTS = [
    # Metadata & Titles
    (r'149 Địa Điểm Du Lịch Tri Tôn', 'Địa Điểm Du Lịch Tri Tôn'),
    (r'149 địa điểm du lịch Tri Tôn', 'địa điểm du lịch Tri Tôn'),
    (r'149 địa điểm du lịch', 'địa điểm du lịch'),
    (r'149 địa điểm xác minh thực tế', 'địa điểm xác minh thực tế'),
    (r'149 địa điểm xác minh', 'địa điểm xác minh'),
    (r'149 địa điểm đã xác minh', 'địa điểm đã xác minh'),
    (r'149 địa điểm thực địa', 'địa điểm thực địa'),
    (r'149 địa điểm', 'địa điểm'),
    (r'149 điểm đến thực tế', 'các điểm đến thực tế'),
    (r'149 điểm đến', 'các điểm đến'),
    (r'149 điểm tham quan', 'các điểm tham quan'),
    (r'149 điểm thực tế', 'các điểm thực tế'),
    (r'149 di tích', 'các di tích'),
    (r'149 danh thắng', 'các danh thắng'),
    (r'149 POIs', 'Danh Mục Điểm Đến'),
    (r'149 POI', 'Điểm Đến'),
    (r'Xem 149 Điểm', 'Khám Phá Điểm Đến'),
    (r'Khám Phá 149 Địa Điểm', 'Khám Phá Địa Điểm'),
    (r'149 bản ghi', 'các bản ghi'),
    (r'Quản trị 149 điểm đến', 'Quản trị điểm đến du lịch'),
    (r'Quản Lý 149 Điểm Đến', 'Quản Lý Điểm Đến'),
    (r'Quản Lý 149 Địa Điểm', 'Quản Lý Địa Điểm'),
    (r'Phân Bố 149 Điểm Đến', 'Phân Bố Điểm Đến'),
    (r'149 Địa Điểm Đã Xác Minh', 'Địa Điểm Đã Xác Minh'),
    (r'Hệ Thống Tọa Độ 149 Địa Điểm', 'Hệ Thống Tọa Độ Địa Điểm'),
    (r'Bản Đồ Du Lịch Số GIS Tri Tôn — Định Vị GPS 149 Điểm Đến Thực Địa', 'Bản Đồ Du Lịch Số GIS Tri Tôn — Định Vị GPS Thực Địa'),
    (r'Master 149 Verified Coordinates', 'Master Verified Coordinates'),
    (r'Đang tải 149 địa điểm', 'Đang tải danh sách địa điểm'),
    (r'149 Verified POIs', 'Verified POIs'),
    (r'149 spots', 'Verified spots')
]

TARGET_EXTS = ('.ts', '.tsx', '.js', '.jsx', '.json', '.md')
EXCLUDE_DIRS = {'node_modules', '.next', '.git', '.system_generated', 'backups'}

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return 0

    original_content = content
    for pattern, repl in REPLACEMENTS:
        content = re.sub(pattern, repl, content)

    # Specific cleanups for dynamic stats like fallback || 149
    content = re.sub(r'\|\|\s*149\b', '|| places.length || 0', content)
    content = re.sub(r'/\s*149\b', '/ (places.length || 1)', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return 1
    return 0

def main():
    print("================================================================================")
    print("🧹 TIẾN TRÌNH LOẠI BỎ TOÀN BỘ SỐ CỐ ĐỊNH '149 ĐỊA ĐIỂM' KHỎI WEBSITE & HỆ THỐNG")
    print("================================================================================")

    modified_count = 0
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if file.endswith(TARGET_EXTS):
                fpath = os.path.join(root, file)
                if process_file(fpath):
                    rel_path = os.path.relpath(fpath, ROOT_DIR)
                    print(f"✓ Đã làm sạch: {rel_path}")
                    modified_count += 1

    print(f"\n🎉 HOÀN TẤT: Đã chuẩn hóa {modified_count} tệp tin trong toàn bộ hệ thống!")
    print("================================================================================")
    return 0

if __name__ == '__main__':
    sys.exit(main())
