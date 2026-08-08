"""
Script Nạp SQL Migration Vào Database Supabase PostgreSQL Thực
File migration: supabase/migrations/20260808_create_video_discoveries.sql
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

# Fix Windows console UTF-8 output encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.local'))

DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("[ERROR] Không tìm thấy DATABASE_URL trong .env.local")
    sys.exit(1)

migrations_dir = os.path.join(os.path.dirname(__file__), '..', 'supabase', 'migrations')
sql_files = sorted([os.path.join(migrations_dir, f) for f in os.listdir(migrations_dir) if f.endswith('.sql')])

print(f"[MIGRATION] Kết nối Supabase PostgreSQL: {DATABASE_URL[:45]}...")

try:
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()
    
    for sql_file in sql_files:
        print(f"[MIGRATION] Đang thực thi {os.path.basename(sql_file)}...")
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        cursor.execute(sql_script)
        print(f"✅ [MIGRATION THÀNH CÔNG] Đã nạp thành công {os.path.basename(sql_file)} vào Supabase!")
        
    cursor.close()
    conn.close()
    print("🎉 [ALL MIGRATIONS COMPLETE] Đã đồng bộ 100% CSDL Supabase PostgreSQL với quy tắc mới!")
except Exception as e:
    print(f"❌ [MIGRATION ERROR] Lỗi khi nạp SQL: {e}")
    sys.exit(1)
