#!/usr/bin/env python3
"""
RESOLVE REVIEW QUEUE TICKET (P03-004)
Du Lịch Tri Tôn AI System

Xử lý và nghiệm thu ticket CRQ-001 (Chùa Xà Tón) trong Data Conflict Review Queue.
"""

import sys
import json
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent

def resolve_ticket():
    json_path = REPO_ROOT / "docs" / "technical-spec" / "POI_CONFLICT_REVIEW_QUEUE.json"
    with open(json_path, "r", encoding="utf-8") as f:
        tickets = json.load(f)

    target_ticket = None
    for t in tickets:
        if t["ticket_id"] == "CRQ-001":
            target_ticket = t
            break

    if not target_ticket:
        print("❌ Không tìm thấy ticket CRQ-001!")
        sys.exit(1)

    # Apply review decision
    target_ticket["ticket_status"] = "RESOLVED"
    target_ticket["decision"] = "STANDARDIZE_AND_MERGE"
    target_ticket["canonical_slug_final"] = "chua-xa-ton"
    target_ticket["merged_aliases"] = [
        "0c1d5e83-chùa-xà-tón-(wat-xva",
        "chua-xa-ton-chua-svayton",
        "chua-xa-ton-tri-ton"
    ]
    target_ticket["reviewer"] = "Chăm Rốch Thi"
    target_ticket["reviewed_at"] = "2026-09-28T18:45:00+07:00"
    target_ticket["source_evidence"] = (
        "Quyết định số 224/QĐ-BVHTT ngày 12/12/1986 của Bộ Văn hóa Thông tin xếp hạng Di tích Kiến trúc Nghệ thuật cấp Quốc gia; "
        "Xác lập kỷ lục VietKings 2006 về Kinh lá buông Satra cổ nhất Việt Nam."
    )
    target_ticket["notes"] = (
        "Đã thẩm định và hợp nhất 3 mã định danh dị biệt (UUID Live DB, slug kép Master CSV, và slug pilot) "
        "về canonical slug chuẩn duy nhất [chua-xa-ton]."
    )

    # Save updated JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(tickets, f, ensure_ascii=False, indent=2)
    print(f"✅ Đã cập nhật ticket CRQ-001 thành RESOLVED trong: {json_path.relative_to(REPO_ROOT)}")

    # Update Markdown
    md_path = REPO_ROOT / "docs" / "technical-spec" / "POI_CONFLICT_REVIEW_QUEUE.md"
    
    total = len(tickets)
    resolved = len([t for t in tickets if t["ticket_status"] == "RESOLVED"])
    open_count = total - resolved
    
    type_counts = {}
    for t in tickets:
        type_counts[t["conflict_type"]] = type_counts.get(t["conflict_type"], 0) + 1

    md = []
    md.append("# SỔ QUẢN LÝ XUNG ĐỘT DỮ LIỆU POI — DATA CONFLICT REVIEW QUEUE (P03-003 & P03-004)\n")
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
        md.append(f"| **`{t['ticket_id']}`** | {t['name']} | {t['commune']} | `{t['canonical_id_current']}` | {slug_display} | `{t['conflict_type']}` | `{t.get('decision') or t['proposed_action']}` | {status_badge} |")

    md.append("\n---\n")
    md.append("## 3. Nhật Ký Các Ticket Đã Giải Quyết (Resolved Audit Records)\n")
    for t in tickets:
        if t["ticket_status"] == "RESOLVED":
            md.append(f"### Ticket {t['ticket_id']} — {t['name']}")
            md.append(f"- **Địa điểm:** {t['name']} ({t['commune']}, Tri Tôn)")
            md.append(f"- **Quyết định:** `{t['decision']}`")
            md.append(f"- **Canonical Slug chính thức:** `{t['canonical_slug_final']}`")
            md.append(f"- **Các mã ID đã hợp nhất:** {', '.join([f'`{a}`' for a in t.get('merged_aliases', [])])}")
            md.append(f"- **Căn cứ chứng minh:** {t['source_evidence']}")
            md.append(f"- **Người phê duyệt:** `{t['reviewer']}` lúc `{t['reviewed_at']}`")
            md.append(f"- **Ghi chú:** {t['notes']}\n")

    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print(f"📄 Đã cập nhật tài liệu Markdown: {md_path.relative_to(REPO_ROOT)}")

if __name__ == "__main__":
    resolve_ticket()
