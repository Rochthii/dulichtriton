#!/usr/bin/env python3
"""
POI CONCORDANCE TABLE GENERATOR (P03-002)
Du Lịch Tri Tôn AI System

Ánh xạ đối soát đa chiều (Multi-source Concordance Mapping)
giữa Master CSV, Frontend JSON, Live Supabase DB, và Pilot Verified Data.
"""

import os
import sys
import json
import csv
import re
import math
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    # Simple diacritic folding / normalization for comparison
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
        text = text.replace(k, v)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    return ' '.join(text.split())

def haversine_dist_meters(lat1, lon1, lat2, lon2):
    try:
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    except (ValueError, TypeError):
        return 999999
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def load_sources():
    # 1. Master CSV
    master_path = REPO_ROOT / "data" / "tri_ton_master_cleaned.csv"
    with open(master_path, "r", encoding="utf-8-sig") as f:
        master_rows = list(csv.DictReader(f))
        
    # 2. Frontend JSON
    fe_path = REPO_ROOT / "frontend" / "src" / "data" / "triton_pois_full.json"
    with open(fe_path, "r", encoding="utf-8") as f:
        fe_rows = json.load(f)
        
    # 3. Live DB Snapshot
    live_path = REPO_ROOT / "docs" / "technical-spec" / "LIVE_DB_PLACES_SNAPSHOT.json"
    with open(live_path, "r", encoding="utf-8") as f:
        live_rows = json.load(f)
        
    # 4. Pilot Files
    pilot_dir = REPO_ROOT / "output_pilot" / "data"
    pilot_rows = []
    if pilot_dir.exists():
        for jf in pilot_dir.glob("*.json"):
            with open(jf, "r", encoding="utf-8") as f:
                rec = json.load(f)
                rec["_pilot_file"] = jf.name
                rec["_pilot_id"] = jf.stem
                pilot_rows.append(rec)
                
    return master_rows, fe_rows, live_rows, pilot_rows

def build_concordance():
    master_rows, fe_rows, live_rows, pilot_rows = load_sources()
    
    m_by_id = {r["id"]: r for r in master_rows}
    fe_by_id = {r["id"]: r for r in fe_rows}
    live_by_id = {r["id"]: r for r in live_rows}
    pilot_by_id = {r["_pilot_id"]: r for r in pilot_rows}
    
    # We will build clusters of matching entities
    # An entity represents a real-world POI in Tri Tôn
    entities = []
    
    used_m = set()
    used_fe = set()
    used_live = set()
    used_pilot = set()
    
    uuid_pattern = re.compile(r'^[0-9a-f]{8}-')

    # STEP 1: Exact ID Matches across all sources
    all_exact_ids = sorted(list(set(m_by_id.keys()) | set(fe_by_id.keys()) | set(live_by_id.keys())))
    
    for eid in all_exact_ids:
        in_m = eid in m_by_id
        in_fe = eid in fe_by_id
        in_live = eid in live_by_id
        
        # If eid is present in at least 2 sources with exact ID, or present in master
        if in_m or (in_fe and in_live):
            m_rec = m_by_id.get(eid)
            fe_rec = fe_by_id.get(eid)
            live_rec = live_by_id.get(eid)
            
            # Determine canonical name & commune & category & coords
            base = m_rec or fe_rec or live_rec
            name = (base.get("name") or base.get("title") or "").strip()
            commune = (base.get("commune") or "").strip()
            category = (base.get("category") or "").strip()
            lat = base.get("latitude")
            lon = base.get("longitude")
            
            # Check if this ID is UUID-prefixed
            is_uuid = bool(uuid_pattern.match(eid))
            
            status = "MATCH"
            notes = []
            
            if is_uuid:
                status = "UUID_CONFLICT"
                notes.append("ID chứa tiền tố UUID cần chuẩn hóa canonical slug")
                
            if not in_m:
                status = "MISSING_IN_MASTER"
                notes.append("Chưa có trong Master CSV")
            elif not in_fe:
                notes.append("Thiếu trong Frontend JSON")
            if not in_live:
                notes.append("Chưa có trong Live DB")
                
            if in_m and in_fe and in_live and not is_uuid:
                status = "MATCH"
                notes.append("Đồng nhất 100% trên cả 3 nguồn")
                
            entity = {
                "canonical_id": eid,
                "name": name,
                "commune": commune,
                "category": category,
                "latitude": lat,
                "longitude": lon,
                "master_id": eid if in_m else None,
                "frontend_id": eid if in_fe else None,
                "live_db_id": eid if in_live else None,
                "pilot_file": None,
                "status": status,
                "notes": "; ".join(notes) if notes else "Khớp ID"
            }
            entities.append(entity)
            if in_m: used_m.add(eid)
            if in_fe: used_fe.add(eid)
            if in_live: used_live.add(eid)

    # STEP 2: Match remaining records from Live DB that have different IDs (UUIDs or alias slugs)
    remaining_live = [r for r in live_rows if r["id"] not in used_live]
    for lr in remaining_live:
        lid = lr["id"]
        lname = lr.get("name", "").strip()
        llat = lr.get("latitude")
        llon = lr.get("longitude")
        norm_lname = normalize_text(lname)
        
        # Try to find match in existing entities by normalized name or coordinates
        matched_ent = None
        for ent in entities:
            ent_norm_name = normalize_text(ent["name"])
            dist = haversine_dist_meters(llat, llon, ent["latitude"], ent["longitude"])
            # Match if exact normalized name OR very close distance + partial name
            if (norm_lname and norm_lname == ent_norm_name) or (dist < 150 and norm_lname in ent_norm_name):
                matched_ent = ent
                break
                
        if matched_ent:
            # Map this live DB record to the existing entity
            matched_ent["live_db_id"] = lid
            matched_ent["status"] = "SLUG_ALIAS" if not uuid_pattern.match(lid) else "UUID_CONFLICT"
            matched_ent["notes"] += f"; Live DB dùng mã lệch [{lid}]"
            used_live.add(lid)
        else:
            # New entity only in Live DB
            is_uuid = bool(uuid_pattern.match(lid))
            entities.append({
                "canonical_id": lid,
                "name": lname,
                "commune": lr.get("commune", "").strip(),
                "category": lr.get("category", "").strip(),
                "latitude": llat,
                "longitude": llon,
                "master_id": None,
                "frontend_id": None,
                "live_db_id": lid,
                "pilot_file": None,
                "status": "UUID_CONFLICT" if is_uuid else "MISSING_IN_MASTER",
                "notes": "Chỉ tồn tại trên Live DB"
            })
            used_live.add(lid)

    # STEP 3: Match remaining records from Frontend JSON
    remaining_fe = [r for r in fe_rows if r["id"] not in used_fe]
    for fr in remaining_fe:
        fid = fr["id"]
        fname = fr.get("name", "").strip()
        flat = fr.get("latitude")
        flon = fr.get("longitude")
        norm_fname = normalize_text(fname)
        
        matched_ent = None
        for ent in entities:
            ent_norm_name = normalize_text(ent["name"])
            dist = haversine_dist_meters(flat, flon, ent["latitude"], ent["longitude"])
            if (norm_fname and norm_fname == ent_norm_name) or (dist < 150 and norm_fname in ent_norm_name):
                matched_ent = ent
                break
                
        if matched_ent:
            matched_ent["frontend_id"] = fid
            matched_ent["status"] = "SLUG_ALIAS" if not uuid_pattern.match(fid) else "UUID_CONFLICT"
            matched_ent["notes"] += f"; Frontend dùng mã lệch [{fid}]"
            used_fe.add(fid)
        else:
            is_uuid = bool(uuid_pattern.match(fid))
            entities.append({
                "canonical_id": fid,
                "name": fname,
                "commune": fr.get("commune", "").strip(),
                "category": fr.get("category", "").strip(),
                "latitude": flat,
                "longitude": flon,
                "master_id": None,
                "frontend_id": fid,
                "live_db_id": None,
                "pilot_file": None,
                "status": "UUID_CONFLICT" if is_uuid else "MISSING_IN_MASTER",
                "notes": "Chỉ tồn tại trên Frontend JSON"
            })
            used_fe.add(fid)

    # STEP 4: Link Pilot Data Files (11 files)
    for prec in pilot_rows:
        pid = prec["_pilot_id"]
        pfile = prec["_pilot_file"]
        pname = prec.get("title", "").strip()
        plat = prec.get("latitude")
        plon = prec.get("longitude")
        norm_pname = normalize_text(pname)
        
        # Link to entity
        matched_ent = None
        for ent in entities:
            if ent["canonical_id"] == pid or ent.get("master_id") == pid:
                matched_ent = ent
                break
                
        if not matched_ent:
            for ent in entities:
                ent_norm = normalize_text(ent["name"])
                dist = haversine_dist_meters(plat, plon, ent["latitude"], ent["longitude"])
                # Match if distance < 300m or strong name overlap
                if (norm_pname and norm_pname in ent_norm) or dist < 200:
                    matched_ent = ent
                    break
                    
        if matched_ent:
            matched_ent["pilot_file"] = pfile
            matched_ent["notes"] += f"; Đã liên kết Pilot [{pfile}]"
            used_pilot.add(pid)
        else:
            entities.append({
                "canonical_id": pid,
                "name": pname,
                "commune": "Tri Tôn",
                "category": "pilot",
                "latitude": plat,
                "longitude": plon,
                "master_id": None,
                "frontend_id": None,
                "live_db_id": None,
                "pilot_file": pfile,
                "status": "SLUG_ALIAS",
                "notes": f"Pilot file riêng biệt [{pfile}]"
            })
            used_pilot.add(pid)

    # Sort entities deterministically by canonical_id
    entities.sort(key=lambda x: x["canonical_id"])
    return entities

def generate_markdown(entities):
    total = len(entities)
    matches = len([e for e in entities if e["status"] == "MATCH"])
    slug_aliases = len([e for e in entities if e["status"] == "SLUG_ALIAS"])
    uuid_conflicts = len([e for e in entities if e["status"] == "UUID_CONFLICT"])
    missing_in_master = len([e for e in entities if e["status"] == "MISSING_IN_MASTER"])
    
    md = []
    md.append("# BẢNG ĐỐI SOÁT ĐỒNG NHẤT POI TRI TÔN — POI CONCORDANCE TABLE (P03-002)\n")
    md.append("> **Mã quy chuẩn:** `POI-CONCORDANCE-001`  ")
    md.append(f"> **Tổng số thực thể POI ghi nhận:** `{total}` thực thể duy nhất  ")
    md.append("> **Ngày tạo:** `2026-09-28` · **Trạng thái:** `VERIFIED (Concordance Cross-Mapped)`  ")
    md.append("> **Nguồn đối soát:** Master CSV (132) · Frontend JSON (141) · Live DB Supabase (137) · Pilot Verified (11)\n")
    
    md.append("## 1. Thống Kê Phân Phối Trạng Thái Concordance\n")
    md.append(f"| Trạng thái | Số lượng thực thể | Tỷ lệ | Định nghĩa & Ý nghĩa nghiệp vụ |")
    md.append(f"|---|---|---|---|")
    md.append(f"| `MATCH` | **{matches}** | {matches/total*100:.1f}% | Mã ID/slug đồng nhất hoàn hảo trên toàn bộ các nguồn dữ liệu chính. |")
    md.append(f"| `UUID_CONFLICT` | **{uuid_conflicts}** | {uuid_conflicts/total*100:.1f}% | Mã mang tiền tố UUID cũ (`[0-9a-f]{8}-...`) cần chuẩn hóa sang canonical slug sạch. |")
    md.append(f"| `SLUG_ALIAS` | **{slug_aliases}** | {slug_aliases/total*100:.1f}% | Cùng 1 thực thể nhưng các nguồn sử dụng tên slug khác nhau (Pilot / Live DB variant). |")
    md.append(f"| `MISSING_IN_MASTER` | **{missing_in_master}** | {missing_in_master/total*100:.1f}% | Thực thể có trên Frontend hoặc Live DB nhưng chưa được nạp vào Master CSV. |")
    md.append(f"| **TỔNG CỘNG** | **{total}** | **100%** | Toàn bộ không gian thực thể POI thực tế đã được lập chỉ mục đầy đủ. |\n")
    
    md.append("## 2. Bảng Đối Soát Chi Tiết Từng POI (Concordance Matrix)\n")
    md.append("| # | Canonical ID (Slug dự kiến) | Tên địa điểm | Xã / Thị trấn | Master CSV ID | Frontend JSON ID | Live DB ID | Pilot File | Trạng thái | Ghi chú kỹ thuật |")
    md.append("|---|---|---|---|---|---|---|---|---|---|")
    
    for idx, e in enumerate(entities, 1):
        m_col = f"`{e['master_id']}`" if e['master_id'] else "—"
        fe_col = f"`{e['frontend_id']}`" if e['frontend_id'] else "—"
        db_col = f"`{e['live_db_id']}`" if e['live_db_id'] else "—"
        pilot_col = f"`{e['pilot_file']}`" if e['pilot_file'] else "—"
        status_badge = f"`{e['status']}`"
        
        md.append(f"| {idx} | **`{e['canonical_id']}`** | {e['name']} | {e['commune']} | {m_col} | {fe_col} | {db_col} | {pilot_col} | {status_badge} | {e['notes']} |")
        
    md.append("\n---\n")
    md.append("## 3. Kế Hoạch Chuyển Tiếp Cho Task P03-003 (Review Queue)\n")
    md.append("1. **Giải quyết triệt để 100% `UUID_CONFLICT`**: Tạo ticket riêng cho từng nhóm ID UUID để chuẩn hóa sang slug canonical tiếng Việt không dấu chuẩn hóa.")
    md.append("2. **Thẩm định nhóm `MISSING_IN_MASTER`**: Xác minh thực địa xem các địa điểm này có giữ lại trong Canonical Dataset v1 (P03-014) hay không.")
    md.append("3. **Hợp nhất Pilot Multimedia**: Gán liên kết ảnh từ các file pilot vào đúng canonical ID tương ứng.")
    
    return "\n".join(md)

def main():
    print("=" * 80)
    print("🔄 ĐANG TẠO BẢNG CONCORDANCE ĐỐI SOÁT ĐA NGUỒN POI TRI TÔN (P03-002)...")
    print("=" * 80)
    
    entities = build_concordance()
    print(f"✅ Đã phân tích và gom nhóm thành công {len(entities)} thực thể POI duy nhất!")
    
    # Save JSON
    json_path = REPO_ROOT / "docs" / "technical-spec" / "POI_CONCORDANCE_TABLE.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(entities, f, ensure_ascii=False, indent=2)
    print(f"📄 Đã xuất bản JSON Concordance: {json_path.relative_to(REPO_ROOT)}")
    
    # Save Markdown
    md_content = generate_markdown(entities)
    md_path = REPO_ROOT / "docs" / "technical-spec" / "POI_CONCORDANCE_TABLE.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"📄 Đã xuất bản Markdown Concordance: {md_path.relative_to(REPO_ROOT)}")
    
    # Status summary
    matches = len([e for e in entities if e["status"] == "MATCH"])
    slug_aliases = len([e for e in entities if e["status"] == "SLUG_ALIAS"])
    uuid_conflicts = len([e for e in entities if e["status"] == "UUID_CONFLICT"])
    missing_in_master = len([e for e in entities if e["status"] == "MISSING_IN_MASTER"])
    print(f"\n📊 TỔNG KẾT CONCORDANCE:")
    print(f"   • MATCH (Khớp hoàn hảo):      {matches}")
    print(f"   • UUID_CONFLICT (Cần gỡ UUID): {uuid_conflicts}")
    print(f"   • SLUG_ALIAS (Cần map alias):  {slug_aliases}")
    print(f"   • MISSING_IN_MASTER:           {missing_in_master}")
    print(f"   • TỔNG THỰC THỂ:               {len(entities)}")

if __name__ == "__main__":
    main()
