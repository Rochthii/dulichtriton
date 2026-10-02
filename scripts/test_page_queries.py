"""
scripts/test_page_queries.py
Test script for verifying place categories, communes and query performance.

REMEDIATION (P05-009):
Database connections and queries are strictly decoupled from import-time.
Importing this module MUST NOT connect to PostgreSQL or execute network socket operations.
Execution is deferred to `run_page_queries_test()` or triggered via `__main__`.
"""
import psycopg2
import os
import sys
from typing import Optional, Dict, Any
from dotenv import load_dotenv

if sys.platform == 'win32' and sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def run_page_queries_test(database_url: Optional[str] = None, connection_fn = None) -> Dict[str, Any]:
    """
    Execute page queries test on-demand.
    Database network connection only opens when explicitly requested.
    """
    load_dotenv('frontend/.env.local')
    db_url = database_url or os.environ.get('DATABASE_URL')
    if not db_url and connection_fn is None:
        raise ValueError("Missing DATABASE_URL environment variable")

    connector = connection_fn or psycopg2.connect
    conn = connector(db_url)
    cur = conn.cursor()
    summary = {}

    try:
        # 1. Total places
        cur.execute("SELECT count(*) FROM places WHERE is_active = true;")
        total_active = cur.fetchone()[0]
        print("Total active places:", total_active)
        summary["total_active"] = total_active

        # 2. Categories in places
        cur.execute("SELECT DISTINCT category, tourism_category, count(*) FROM places GROUP BY category, tourism_category ORDER BY count(*) DESC;")
        print("\n--- CATEGORY BREAKDOWN ---")
        categories = []
        for r in cur.fetchall():
            print(f"  category='{r[0]}', tourism_category='{r[1]}' -> {r[2]} places")
            categories.append({"category": r[0], "tourism_category": r[1], "count": r[2]})
        summary["categories"] = categories

        # 3. Communes in places
        cur.execute("SELECT DISTINCT commune, count(*) FROM places GROUP BY commune ORDER BY count(*) DESC;")
        print("\n--- COMMUNE BREAKDOWN ---")
        communes = []
        for r in cur.fetchall():
            print(f"  commune='{r[0]}' -> {r[1]} places")
            communes.append({"commune": r[0], "count": r[1]})
        summary["communes"] = communes

        # 4. Test food query
        cur.execute("SELECT count(*) FROM places WHERE category = 'food' OR tourism_category ILIKE '%ẩm thực%' OR tourism_category ILIKE '%cà phê%';")
        food_count = cur.fetchone()[0]
        print("\nFood matches count:", food_count)
        summary["food_matches"] = food_count

        # 5. Test stay query
        cur.execute("SELECT count(*) FROM places WHERE category = 'stay' OR tourism_category ILIKE '%homestay%' OR tourism_category ILIKE '%khách sạn%' OR tourism_category ILIKE '%resort%';")
        stay_count = cur.fetchone()[0]
        print("Stay matches count:", stay_count)
        summary["stay_matches"] = stay_count

        # 6. Test culture query
        cur.execute("SELECT count(*) FROM places WHERE category = 'culture' OR category = 'history' OR tourism_category ILIKE '%văn hóa%' OR tourism_category ILIKE '%tâm linh%' OR tourism_category ILIKE '%di tích%' OR tourism_category ILIKE '%chùa%';")
        culture_count = cur.fetchone()[0]
        print("Culture matches count:", culture_count)
        summary["culture_matches"] = culture_count

        # 7. Test nature query
        cur.execute("SELECT count(*) FROM places WHERE category = 'nature' OR tourism_category ILIKE '%thiên nhiên%' OR tourism_category ILIKE '%cảnh quan%';")
        nature_count = cur.fetchone()[0]
        print("Nature matches count:", nature_count)
        summary["nature_matches"] = nature_count

        return {"success": True, "summary": summary}
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    run_page_queries_test()
