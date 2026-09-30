#!/usr/bin/env python3
"""
DATA CONFLICT REVIEW QUEUE GENERATOR (P03-003)
Du Lịch Tri Tôn AI System

Tạo sổ theo dõi xử lý xung đột dữ liệu (Review Queue) cho toàn bộ
các thực thể POI có mâu thuẫn ID/slug giữa các nguồn.
Mỗi xung đột được cấp một mã ticket riêng biệt (CRQ-001 -> CRQ-xxx).
"""

import sys
import json
import re
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent

def generate_clean_slug(name: str, fallback_id: str) -> str:
    # Generate a clean, lowercase ASCII slug from Vietnamese name
    if not name:
        return fallback_id.replace(" ", "-").lower()
    
    name = name.lower().strip()
    replacements = {
        'à':'a', 'á':'a', 'ả':'a', 'ã':'a', 'ạ':'a',
        'ă':'a', 'ằ':'a', 'ắ':'a', 'ẳ':'a', 'ẵ':'a', 'ặ':'a',
        'â':'a', 'ầ':'a', 'ấ':'a', 'ẩ':'a', 'ẫ':'a', 'ậ':'a',
        'đ':'d',
        'è':'e', 'é':'e', 'ẻ':'e', 'ẽ':'e', 'ẹ':'e',
        'ê':'e', 'ề':'e', 'ế':'e', 'ể':'e', 'ễ':'e', 'ệ':'e',
        'ì':'i', 'í':'i', 'ỉ':'i', 'ĩ':'i', 'ị':'i',
        'ò':'o', 'ó':'o', 'ỏ':'o', 'õ':'o', 'ọ':'o',
        'ô':'o', 'ồ':'o', 'ố':'o', 'ổ':'o', 'ỗ':'o', 'ộ':'o',
        'ơ':'o', 'ờ':'o', 'ớ':'o', 'ở':'o', 'ỡ':'o', 'ợ':'o',
        'ù':'u', 'ú':'u', 'ủ':'u', 'ũ':'u', 'ụ':'u',
        'ư':'u', 'ừ':'u', 'ứ':'u', 'ử':'u', 'ữ':'u', 'ự':'u',
        'ỳ':'y', 'ý':'y', 'ỷ':'y', 'ỹ':'y', 'ỵ':'y'
    }
    for k, v in replacements.items():
        name = name.replace(k, v)
    name = re.sub(r'[^a-z0-9\s-]', '', name)
    name = re.sub(r'[\s_]+', '-', name)
    name = re.sub(r'-+', '-', name).strip('-')
    return name or fallback_id

def main():
    print("=" * 80)
    print("📋 ĐANG KHỞI TẠO DATA CONFLICT REVIEW QUEUE (P03-003)...")
    print("=" * 80)
    
    concordance_path = REPO_ROOT / "docs" / "technical-spec" / "POI_CONCORDANCE_TABLE.json"
    if not concordance_path.exists():
        print(f"❌ Không tìm thấy {concordance_path}")
        sys.exit(1)
        
    with open(concordance_path, "r", encoding="utf-8") as f:
        entities = json.load(f)
        
    conflicts = [e for e in entities if e["status"] != "MATCH"]
    print(f"🔍 Phát hiện {len(conflicts)} thực thể cần đưa vào Review Queue.")
    
    tickets = []
    uuid_pattern = re.compile(r'^[0-9a-f]{8}-')
    
    for idx, e in enumerate(conflicts, 1):
        ticket_id = f"CRQ-{idx:03d}"
        status = e["status"]
        name = e["name"]
        cid = e["canonical_id"]
        commune = e["commune"]
        
        # Categorize conflict type & proposed resolution
        if status == "UUID_CONFLICT":
            conflict_type = "UUID_PREFIX_STANDARDIZATION"
            # Strip uuid prefix if exists in slug, or generate from name
            clean_suggested = generate_clean_slug(name, cid)
            proposed_action = "STANDARDIZE_SLUG"
            summary = f"Chuẩn hóa ID UUID [{cid}] thành slug canonical sạch [{clean_suggested}]"
        elif status == "SLUG_ALIAS":
            conflict_type = "PILOT_ALIAS_MAPPING"
            clean_suggested = generate_clean_slug(name, cid)
            proposed_action = "MERGE_ALIAS_TO_CANONICAL"
            summary = f"Ánh xạ biến thể pilot [{cid}] về canonical slug chính thức [{clean_suggested}]"
        elif status == "MISSING_IN_MASTER":
            conflict_type = "UNSYNCED_MASTER_DATA"
            clean_suggested = generate_clean_slug(name, cid)
            proposed_action = "VERIFY_AND_INGEST_TO_MASTER"
            summary = f"Thẩm định thực địa và nạp bản ghi [{cid}] từ Frontend/DB vào Master CSV"
        else:
            conflict_type = "GENERAL_CONFLICT"
            clean_suggested = cid
            proposed_action = "MANUAL_INSPECTION"
            summary = f"Rà soát dị biệt dữ liệu cho [{cid}]"

        ticket = {
            "ticket_id": ticket_id,
            "canonical_id_current": cid,
            "proposed_canonical_slug": clean_suggested,
            "name": name,
            "commune": commune,
            "category": e.get("category", "general"),
            "latitude": e.get("latitude"),
            "longitude": e.get("longitude"),
            "conflict_type": conflict_type,
            "source_status": {
                "in_master_csv": bool(e.get("master_id")),
                "master_id": e.get("master_id"),
                "in_frontend_json": bool(e.get("frontend_id")),
                "frontend_id": e.get("frontend_id"),
                "in_live_db": bool(e.get("live_db_id")),
                "live_db_id": e.get("live_db_id"),
                "pilot_file": e.get("pilot_file")
            },
            "proposed_action": proposed_action,
            "ticket_status": "OPEN_FOR_REVIEW",
            "summary": summary,
            "decision": None,
            "reviewer": None,
            "reviewed_at": None,
            "notes": e.get("notes", "")
        }
        tickets.append(ticket)
        
    # Write JSON
    json_path = REPO_ROOT / "docs" / "technical-spec" / "POI_CONFLICT_REVIEW_QUEUE.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(tickets, f, ensure_ascii=False, indent=2)
    print(f"📄 Đã lưu {len(tickets)} tickets dạng JSON tại: {json_path.relative_to(REPO_ROOT)}")
    
    # Write Markdown
    md_path = REPO_ROOT / "docs" / "technical-spec" / "POI_CONFLICT_REVIEW_QUEUE.md"
    md = []
    md.append("# SỔ QUẢN LÝ XUNG ĐỘT DỮ LIỆU POI — DATA CONFLICT REVIEW QUEUE (P03-003)\n")
    md.append("> **Mã quy chuẩn:** `DATA-CONFLICT-QUEUE-001`  ")
    md.append(f"> **Tổng số Ticket xung đột:** `{len(tickets)}` tickets độc lập  ")
    md.append("> **Ngày lập:** `2026-09-28` · **Trạng thái:** `ACTIVE_REVIEW_QUEUE`  ")
    md.append("> **Nguyên tắc:** Mỗi xung đột có một ticket riêng (Atomic Ticket); không đóng bulk ticket; mọi quyết định đều có nguồn minh chứng.\n")
    
    # Summary of conflict types
    type_counts = {}
    for t in tickets:
        type_counts[t["conflict_type"]] = type_counts.get(t["conflict_type"], 0) + 1
        
    md.append("## 1. Phân Loại Danh Mục Xung Đột\n")
    md.append("| Loại xung đột | Số lượng ticket | Tỷ lệ | Định hướng xử lý đề xuất |")
    md.append("|---|---|---|---|")
    for ctype, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
        rate = count / len(tickets) * 100
        desc = ""
        if ctype == "UUID_PREFIX_STANDARDIZATION":
            desc = "Chuẩn hóa ID chứa prefix UUID (8 ký tự) sang slug tiếng Việt không dấu sạch."
        elif ctype == "UNSYNCED_MASTER_DATA":
            desc = "Thẩm định thực địa xem POI có thực sự tồn tại ở Tri Tôn để nạp vào Master CSV hoặc loại bỏ."
        elif ctype == "PILOT_ALIAS_MAPPING":
            desc = "Ánh xạ file cào pilot vào slug canonical chính thức để kế thừa toàn bộ ảnh và multimedia."
        md.append(f"| `{ctype}` | **{count}** | {rate:.1f}% | {desc} |")
    md.append(f"| **TỔNG CỘNG** | **{len(tickets)}** | **100%** | Toàn bộ ticket đã được khởi tạo và sẵn sàng thẩm định. |\n")
    
    md.append("## 2. Bảng Theo Dõi Chi Tiết Toàn Bộ Tickets (Review Queue Table)\n")
    md.append("| Ticket ID | Tên địa điểm | Xã / Thị trấn | ID hiện tại | Slug đề xuất | Loại xung đột | Hành động đề xuất | Trạng thái |")
    md.append("|---|---|---|---|---|---|---|---|")
    for t in tickets:
        md.append(f"| **`{t['ticket_id']}`** | {t['name']} | {t['commune']} | `{t['canonical_id_current']}` | `{t['proposed_canonical_slug']}` | `{t['conflict_type']}` | `{t['proposed_action']}` | `{t['ticket_status']}` |")
        
    md.append("\n---\n")
    md.append("## 3. Quy Trình Nghiệm Thu & Xử Lý Từng Ticket (P03-004+)\n")
    md.append("- **Bước 1:** Đối chiếu tọa độ thực tế và địa giới hành chính Tri Tôn (Decision Gate G1).")
    md.append("- **Bước 2:** Xác nhận slug canonical duy nhất không trùng lặp.")
    md.append("- **Bước 3:** Ghi nhận quyết định (`MERGE`, `KEEP`, `STANDARDIZE_SLUG`, `REJECT`), tên người duyệt và thời điểm duyệt.")
    md.append("- **Bước 4:** Áp dụng kết quả vào Canonical Dataset Manifest v1 (P03-014).")
    
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print(f"📄 Đã lưu tài liệu Review Queue tại: {md_path.relative_to(REPO_ROOT)}")
    print(f"\n✅ Hoàn thành 100% Task P03-003: Đã cấp phát {len(tickets)} tickets riêng biệt!")

if __name__ == "__main__":
    main()
