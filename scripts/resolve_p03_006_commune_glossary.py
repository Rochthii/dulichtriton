#!/usr/bin/env python3
"""
RESOLVE COMMUNE GLOSSARY COMPLIANCE (P03-006)
Du Lịch Tri Tôn AI System

1. Chuẩn hóa nhãn commune ngoài glossary cho Ticket CRQ-086 (Hàng Thốt Nốt Trái Tim: 'Tri Tôn' -> 'Xã An Tức').
2. Khắc phục lỗi chính tả (typo) trong Master CSV (Row 120: 'Xã Lương Cương' -> 'Xã Lương Phi').
3. Cập nhật Review Queue JSON và Markdown.
"""

import sys
import json
import csv
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent

def fix_master_csv_typo():
    master_path = REPO_ROOT / "data" / "tri_ton_master_cleaned.csv"
    with open(master_path, "r", encoding="utf-8-sig") as f:
        content = f.read()

    if "Xã Lương Cương" in content:
        new_content = content.replace("Xã Lương Cương", "Xã Lương Phi")
        with open(master_path, "w", encoding="utf-8-sig", newline="") as f:
            f.write(new_content)
        print("✅ Đã sửa chính xác lỗi typo trong Master CSV ('Xã Lương Cương' -> 'Xã Lương Phi')")
    else:
        print("ℹ️ Master CSV không còn lỗi 'Xã Lương Cương'")

def resolve_ticket_crq_086():
    json_path = REPO_ROOT / "docs" / "technical-spec" / "POI_CONFLICT_REVIEW_QUEUE.json"
    with open(json_path, "r", encoding="utf-8") as f:
        tickets = json.load(f)

    target_ticket = None
    for t in tickets:
        if t["ticket_id"] == "CRQ-086":
            target_ticket = t
            break

    if not target_ticket:
        print("❌ Không tìm thấy ticket CRQ-086!")
        sys.exit(1)

    # Apply review decision for CRQ-086
    target_ticket["ticket_status"] = "RESOLVED"
    target_ticket["decision"] = "STANDARDIZE_COMMUNE_GLOSSARY_AND_MERGE_ALIAS"
    target_ticket["canonical_slug_final"] = "cay-thot-not-trai-tim"
    target_ticket["commune_original"] = target_ticket["commune"]
    target_ticket["commune"] = "Xã An Tức"
    target_ticket["merged_aliases"] = [
        "hang-thot-not-khmer-trai-tim"
    ]
    target_ticket["reviewer"] = "Chăm Rốch Thi"
    target_ticket["reviewed_at"] = "2026-09-28T20:55:00+07:00"
    target_ticket["source_evidence"] = (
        "Quy chuẩn địa giới hành chính 15 xã/thị trấn Tri Tôn (RULE 02); Bảng đối soát POI Concordance; "
        "Địa danh thực tế: Cây thốt nốt hình trái tim tọa lạc tại ấp Phú Hiệp, Xã An Tức, Huyện Tri Tôn (giáp ranh Xã Ô Lâm); "
        "Khớp nối toàn diện với bản ghi chuẩn cay-thot-not-trai-tim."
    )
    target_ticket["notes"] = (
        "Chuẩn hóa nhãn commune ngoài glossary từ nhãn cộc 'Tri Tôn' thành danh xưng chuẩn 'Xã An Tức' theo RULE 02. "
        "Đồng thời ánh xạ alias pilot [hang-thot-not-khmer-trai-tim] về canonical slug hệ thống [cay-thot-not-trai-tim] "
        "để kế thừa trọn vẹn bộ ảnh cào pilot độ nét cao."
    )

    # Save updated JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(tickets, f, ensure_ascii=False, indent=2)
    print(f"✅ Đã cập nhật ticket CRQ-086 thành RESOLVED trong: {json_path.relative_to(REPO_ROOT)}")

    # Update Markdown
    md_path = REPO_ROOT / "docs" / "technical-spec" / "POI_CONFLICT_REVIEW_QUEUE.md"
    
    total = len(tickets)
    resolved = len([t for t in tickets if t["ticket_status"] == "RESOLVED"])
    open_count = total - resolved
    
    type_counts = {}
    for t in tickets:
        type_counts[t["conflict_type"]] = type_counts.get(t["conflict_type"], 0) + 1

    md = []
    md.append("# SỔ QUẢN LÝ XUNG ĐỘT DỮ LIỆU POI — DATA CONFLICT REVIEW QUEUE (P03-003 -> P03-006)\n")
    md.append("> **Mã quy chuẩn:** `DATA-CONFLICT-QUEUE-001`  ")
    md.append(f"> **Tổng số Ticket xung đột:** `{total}` tickets độc lập (`{resolved}` RESOLVED / `{open_count}` OPEN)  ")
    md.append("> **Ngày cập nhật:** `2026-09-28` · **Trạng thái:** `ACTIVE_REVIEW_QUEUE (Incremental Resolution)`  ")
    md.append("> **Nguyên tắc:** Mỗi xung đột có một ticket riêng (Atomic Ticket); không đóng bulk ticket; mọi quyết định đều có nguồn minh chứng.\n")

    md.append("## 1. Phân Loại Danh Mục Xung Đột\n")
    md.append("| Loại xung đột | Số lượng ticket | Tỷ lệ | Định hướng xử lý đề xuất |")
    md.append("|---|---|---|---|")
    for ctype, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
        rate = count / total * 100
        desc = ""
        if ctype == "UUID_PREFIX_STANDARDIZATION":
            desc = "Chuẩn hóa ID chứa prefix UUID (8 ký tự) sang slug tiếng Việt không dấu sạch."
        elif ctype == "UNSYNCED_MASTER_DATA":
            desc = "Thẩm định thực địa xem POI có thực sự tồn tại ở Tri Tôn để nạp vào Master CSV hoặc loại bỏ."
        elif ctype == "PILOT_ALIAS_MAPPING":
            desc = "Ánh xạ file cào pilot vào slug canonical chính thức để kế thừa toàn bộ ảnh và multimedia."
        md.append(f"| `{ctype}` | **{count}** | {rate:.1f}% | {desc} |")
    md.append(f"| **TỔNG CỘNG** | **{total}** | **100%** | `{resolved}` đã giải quyết, `{open_count}` đang chờ duyệt. |\n")

    md.append("## 2. Bảng Theo Dõi Chi Tiết Toàn Bộ Tickets (Review Queue Table)\n")
    md.append("| Ticket ID | Tên địa điểm | Xã / Thị trấn | ID hiện tại | Slug đề xuất / Đã duyệt | Loại xung đột | Hành động đề xuất | Trạng thái |")
    md.append("|---|---|---|---|---|---|---|---|")
    for t in tickets:
        status_badge = f"**`RESOLVED`** ✅" if t["ticket_status"] == "RESOLVED" else f"`{t['ticket_status']}`"
        slug_display = f"**`{t.get('canonical_slug_final') or t['proposed_canonical_slug']}`**"
        commune_disp = t.get("commune", "")
        if t.get("boundary_flag"):
            commune_disp += f" *(Cờ: `{t['boundary_flag']}`)*"
        md.append(f"| **`{t['ticket_id']}`** | {t['name']} | {commune_disp} | `{t['canonical_id_current']}` | {slug_display} | `{t['conflict_type']}` | `{t.get('decision') or t['proposed_action']}` | {status_badge} |")

    md.append("\n---\n")
    md.append("## 3. Nhật Ký Các Quyết Định Thẩm Định Đã Giải Quyết (Resolved Audit Records)\n")
    for t in tickets:
        if t["ticket_status"] == "RESOLVED":
            md.append(f"### Ticket {t['ticket_id']} — {t['name']}")
            md.append(f"- **Địa điểm:** {t['name']} ({t.get('commune_original') or t['commune']}, Tri Tôn)")
            if t.get("commune_original"):
                md.append(f"- **Đơn vị hành chính chuẩn hóa:** `{t['commune']}` (gốc ngoài glossary: `{t['commune_original']}`)")
            if t.get("boundary_flag"):
                md.append(f"- **Cờ đặc thù địa giới:** `{t['boundary_flag']}`")
            md.append(f"- **Quyết định:** `{t['decision']}`")
            md.append(f"- **Canonical Slug chính thức:** `{t['canonical_slug_final']}`")
            md.append(f"- **Các mã ID đã hợp nhất:** {', '.join([f'`{a}`' for a in t.get('merged_aliases', [])])}")
            md.append(f"- **Căn cứ chứng minh:** {t['source_evidence']}")
            md.append(f"- **Người phê duyệt:** `{t['reviewer']}` lúc `{t['reviewed_at']}`")
            md.append(f"- **Ghi chú:** {t['notes']}\n")

    # Add section for Out-of-bounds rejection log
    md.append("### Danh Mục Thực Thể Ngoại Vi Bị Loại Trừ Do Vượt Bounding Box (Out-of-Bounds Rejection Log)")
    md.append("- **Mã Thực Thể:** `diem-du-lich-tri-ton-12` (`ភូមិស្រែឃ្មួញ`)")
    md.append("- **Nguồn gốc:** Tệp cào thô lịch sử `triton_pois_table.csv` và `triton_pois_map.geojson` (bản ghi số 24)")
    md.append("- **Tọa độ ghi nhận:** `Latitude: 10.5567842, Longitude: 104.8948393`")
    md.append("- **Lý do vi phạm:** Vĩ độ `10.5567842` vượt trần Bounding Box `10.55` của Huyện Tri Tôn và vi phạm CHECK constraint `chk_places_latitude_boundary`. Đồng thời nhãn xã 'Thị trấn Tri Tôn' bị gán sai lệch nghiêm trọng.")
    md.append("- **Quyết định:** `REJECT_OUT_OF_BOUNDS` — Cấm tuyệt đối nạp vào Master Data sạch hoặc cơ sở dữ liệu production.")
    md.append("- **Người phê duyệt:** `Chăm Rốch Thi` lúc `2026-09-28T19:15:00+07:00`\n")

    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print(f"📄 Đã cập nhật tài liệu Markdown: {md_path.relative_to(REPO_ROOT)}")

if __name__ == "__main__":
    fix_master_csv_typo()
    resolve_ticket_crq_086()
