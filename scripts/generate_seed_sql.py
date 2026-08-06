import json
import os
import sys

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, list):
        # Convert list to PostgreSQL ARRAY literal
        escaped_items = [v.replace("'", "''") for v in val]
        items_str = ",".join(f"'{item}'" for item in escaped_items)
        return f"ARRAY[{items_str}]" if items_str else "'{}'::text[]"
    
    escaped = str(val).replace("'", "''")
    return f"'{escaped}'"

def main():
    print("=== SEED SQL GENERATOR FOR SUPABASE (106 PLACES) ===")
    
    master_path = "data/tri_ton_master_cleaned.json"
    if not os.path.exists(master_path):
        print(f"ERROR: {master_path} not found!")
        return

    with open(master_path, "r", encoding="utf-8") as f:
        places = json.load(f)

    sql_lines = [
        "-- ====================================================================",
        "-- DU LICH TRI TON - PRODUCTION MASTER SEED DATA (106 LOCATIONS)",
        "-- ====================================================================",
        "BEGIN;",
        ""
    ]

    for p in places:
        rec_id = p.get("id")
        place_id = p.get("place_id", rec_id)
        name = p.get("name", "")
        slug_base = name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("/", "-")
        slug = f"{slug_base}-{rec_id.lower()}"
        category = p.get("category", "attractions_nature")
        address = p.get("address", "")
        commune = p.get("commune", "")
        lat = float(p.get("latitude", 0))
        lng = float(p.get("longitude", 0))
        opening_hours = p.get("opening_hours", "07:00 - 18:00")
        ticket_price = p.get("ticket_price", "Miễn phí")
        rating = float(p.get("rating", 4.5))
        review_count = int(p.get("review_count", 100))
        confidence = float(p.get("confidence_score", 95.0))
        desc = p.get("description", "")

        insert_stmt = f"""INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    {escape_sql(rec_id)}, {escape_sql(place_id)}, {escape_sql(name)}, {escape_sql(slug)},
    {escape_sql(category)}, {escape_sql(category)}, {escape_sql(desc)},
    {escape_sql(address)}, {escape_sql(commune)}, {lat}, {lng},
    {escape_sql(opening_hours)}, {escape_sql(ticket_price)}, {rating}, {review_count},
    {confidence}, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;"""
        sql_lines.append(insert_stmt)
        sql_lines.append("")

    # Add video seeding
    videos_path = "data/tri_ton_videos.json"
    if os.path.exists(videos_path):
        with open(videos_path, "r", encoding="utf-8") as f:
            videos = json.load(f)
            sql_lines.append("-- SEED VIDEOS")
            for v in videos:
                v_title = v.get("title", "")
                v_platform = v.get("platform", "tiktok")
                v_video_url = v.get("video_url", "")
                v_embed_url = v.get("embed_url", "")
                v_author = v.get("author", "")
                
                v_stmt = f"""INSERT INTO public.videos (
    place_id, title, platform, video_url, embed_url, author_name, is_verified
) VALUES (
    'PL001', {escape_sql(v_title)}, {escape_sql(v_platform)}, {escape_sql(v_video_url)}, {escape_sql(v_embed_url)}, {escape_sql(v_author)}, TRUE
) ON CONFLICT DO NOTHING;"""
                sql_lines.append(v_stmt)
                sql_lines.append("")

    sql_lines.append("COMMIT;")

    os.makedirs("export", exist_ok=True)
    seed_file = "export/seed_places.sql"
    with open(seed_file, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    print(f"SUCCESS: Generated {len(places)} locations seed SQL at {seed_file}")

if __name__ == "__main__":
    main()
