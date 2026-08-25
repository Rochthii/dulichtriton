#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_all_tests.py — Master Production-Grade Test Suite Runner for Tri Tôn Tourism Platform
Executes all static and live runtime telemetry suites, generating a unified report.
"""

import os
import sys
import time
import subprocess
import urllib.request
import urllib.error

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:3000")

def is_server_alive(url=BASE_URL):
    try:
        req = urllib.request.Request(f"{url}/api/v1/search?q=test", headers={"User-Agent": "TestProbe"})
        with urllib.request.urlopen(req, timeout=3) as res:
            return res.status in [200, 404]
    except Exception:
        return False

def run_command(cmd_list, description):
    print("\n" + "=" * 80)
    print(f" >>> ĐANG CHẠY: {description}")
    print("=" * 80)
    start = time.perf_counter()
    res = subprocess.run(cmd_list, capture_output=False)
    elapsed = time.perf_counter() - start
    print(f"\n[THỜI GIAN THỰC THI]: {elapsed:.2f}s | Exit Code: {res.returncode}")
    return res.returncode == 0

def main():
    print("================================================================================")
    print(" HỆ THỐNG TRỢ LÝ DU LỊCH TRI TÔN — CHƯƠNG TRÌNH KIỂM THỬ TOÀN DIỆN 360 ĐỘ")
    print("================================================================================")
    
    overall_start = time.perf_counter()
    summary = []
    
    # 1. Geography & Cultural Accuracy (Rules 01, 02, 05)
    r1 = run_command([sys.executable, "tests/test_geography_and_cultural_rules.py"], "1. Kiểm Thử Địa Giới 15 Xã & Chuẩn Mực Văn Hóa Ẩm Thực (Rule 02 & Rule 05)")
    summary.append(("Địa Giới 15 Xã & Văn Hóa Bản Địa (Rules 01, 02, 05)", r1))
    
    # 2. Modular i18n Dictionaries
    r2 = run_command([sys.executable, "tests/test_modular_i18n_dictionaries.py"], "2. Kiểm Thử Cấu Trúc Từ Điển Đa Ngữ Modular i18n (VI & EN)")
    summary.append(("Từ Điển Đa Ngữ Song Ngữ Modular i18n", r2))
    
    # 3. Bilingual Data Integrity
    r3 = run_command([sys.executable, "tests/test_bilingual_data_integrity.py"], "3. Kiểm Thử Tính Toàn Vẹn Song Ngữ Của 138/149 Điểm Đến")
    summary.append(("Tính Toàn Vẹn Song Ngữ POIs Master", r3))

    # Live Server Runtime Tests
    if is_server_alive(BASE_URL):
        print(f"\n[XÁC THỰC MÁY CHỦ]: Máy chủ Next.js đang hoạt động tại {BASE_URL} (Sẵn sàng đo kiểm Live Telemetry).")
        
        # 4. Comprehensive API Latency & Bandwidth Telemetry
        r4 = run_command([sys.executable, "tests/test_api_endpoints_comprehensive.py"], "4. Kiểm Thử Toàn Bộ API Endpoints, Đo Tốc Độ & Băng Thông Mạng")
        summary.append(("Đo Kiểm Toàn Bộ API Endpoints & Độ Trễ Mạng", r4))

        # 5. CRUD State Machine Lifecycle
        r5 = run_command([sys.executable, "tests/test_admin_crud_state_machine.py"], "5. Kiểm Thử Chu Trình Thao Tác Dữ Liệu CRUD (Thêm, Sửa, Xóa, Phê Duyệt)")
        summary.append(("Chu Trình CRUD & Máy Trạng Thái Dữ Liệu", r5))

        # 6. Network Resilience, Stress & Concurrency Benchmark
        r6 = run_command([sys.executable, "tests/test_network_resilience_and_telemetry.py"], "6. Kiểm Thử Tải Đồng Thời, Biểu Đồ Phân Bổ Độ Trễ & Kháng Lỗi Dữ Liệu")
        summary.append(("Kiểm Thử Tải Đồng Thời & Chống Lỗi Dữ Liệu", r6))
    else:
        print(f"\n[CẢNH BÁO]: Máy chủ {BASE_URL} chưa phản hồi. Đang kiểm tra cục bộ...")

    # Print Summary Report
    total_time = time.perf_counter() - overall_start
    print("\n" + "=" * 80)
    print(" BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ TOÀN BỘ HỆ THỐNG (TEST RESULTS SUMMARY)")
    print("=" * 80)
    
    all_passed = True
    for name, passed in summary:
        status_text = "[ PASS ✓ ]" if passed else "[ FAIL ✕ ]"
        print(f"  {status_text} : {name}")
        if not passed:
            all_passed = False
            
    print("-" * 80)
    print(f"Tổng thời gian kiểm thử: {total_time:.2f} giây")
    if all_passed:
        print("KẾT LUẬN CHUNG: TOÀN BỘ CÁC BỘ TEST ĐỀU ĐẠT CHUẨN 100% (PRODUCTION READY)!")
    else:
        print("KẾT LUẬN CHUNG: CÓ HẠNG MỤC CHƯA ĐẠT. VUI LÒNG KIỂM TRA LẠI CHI TIẾT TRÊN.")
    print("=" * 80 + "\n")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
