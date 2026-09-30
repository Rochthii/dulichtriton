#!/usr/bin/env python3
"""
AUDIT SOS HOTLINES & EMERGENCY DATA (P03-007)
Du Lịch Tri Tôn AI System

Kiểm toán toàn bộ danh bạ đường dây nóng, hotline cứu hộ, công an, y tế
trên cả frontend và backend dữ liệu.
"""

import sys
import re
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent

kw_pattern = re.compile(r'(113|114|115|cấp cứu|công an|hotline|khẩn cấp|sos|cứu hộ|trung tâm y tế|bệnh viện|0296)', re.IGNORECASE)

def find_sos_references():
    search_dirs = [
        REPO_ROOT / "frontend" / "src",
        REPO_ROOT / "data"
    ]
    
    results = {}
    
    for sdir in search_dirs:
        for p in sdir.glob("**/*"):
            if p.is_file() and p.suffix in [".ts", ".tsx", ".json", ".js", ".csv"]:
                try:
                    with open(p, "r", encoding="utf-8", errors="ignore") as f:
                        lines = f.readlines()
                    file_matches = []
                    for lno, line in enumerate(lines, 1):
                        if kw_pattern.search(line):
                            file_matches.append((lno, line.strip()))
                    if file_matches:
                        results[str(p.relative_to(REPO_ROOT))] = file_matches
                except Exception:
                    pass

    print("=" * 80)
    print("🚨 BÁO CÁO KIỂM KÊ DANH BẠ ĐƯỜNG DÂY NÓNG SOS & CỨU HỘ DU LỊCH TRI TÔN")
    print("=" * 80)
    print(f"Tổng số tập tin có tham chiếu SOS / Hotline: {len(results)}\n")
    
    for fpath, matches in sorted(results.items()):
        print(f"📂 TỆP: {fpath} ({len(matches)} dòng khớp)")
        for lno, line in matches[:5]:
            print(f"   L{lno}: {line[:120]}")
        if len(matches) > 5:
            print(f"   ... (còn {len(matches) - 5} dòng)")
        print()

if __name__ == "__main__":
    find_sos_references()
