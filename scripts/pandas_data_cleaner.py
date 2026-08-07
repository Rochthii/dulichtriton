import os
import sys
import json
import unicodedata
import pandas as pd

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def normalize_nfc(text):
    if not isinstance(text, str) or pd.isna(text):
        return ""
    text = unicodedata.normalize("NFC", text)
    # Remove banned phrase 'Huyện Tri Tôn'
    text = text.replace("Huyện Tri Tôn, ", "").replace(", Huyện Tri Tôn", "").replace("Huyện Tri Tôn", "")
    # Fix administrative commune errors
    text = text.replace("Xã Chau Lăng", "Xã Châu Lăng")
    text = text.replace("Xã Cô Tô", "Xã Núi Tô")
    text = text.replace("Tran Hung Dao", "Trần Hưng Đạo")
    return text.strip()

def main():
    print("=== PANDAS DU LỊCH TRI TÔN DATA CLEANING PIPELINE ===")
    
    csv_path = "data/tri_ton_master_cleaned.csv"
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    # Load dataset with Pandas
    df = pd.read_csv(csv_path, encoding="utf-8-sig")
    initial_count = len(df)
    print(f"1. Raw Records Loaded: {initial_count}")

    # Normalize all string columns to NFC standard
    str_cols = df.select_dtypes(include=['object']).columns
    for col in str_cols:
        df[col] = df[col].apply(normalize_nfc)

    # Convert numeric fields
    df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
    df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
    df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(4.5)
    df['review_count'] = pd.to_numeric(df['review_count'], errors='coerce').fillna(100).astype(int)
    df['confidence_score'] = pd.to_numeric(df['confidence_score'], errors='coerce').fillna(95.0)

    # GIS Bounding Box Validation [10.25 - 10.55 Lat, 104.85 - 105.15 Lng]
    valid_coords = (df['latitude'] >= 10.25) & (df['latitude'] <= 10.55) & \
                   (df['longitude'] >= 104.85) & (df['longitude'] <= 105.15)
    df = df[valid_coords].copy()
    print(f"2. Valid GIS Bounding Box Records: {len(df)} (Removed {initial_count - len(df)} out-of-bounds)")

    # Deduplication using normalized place name + rounded lat/lng
    df['norm_name'] = df['name'].str.lower()
    df['round_lat'] = df['latitude'].round(3)
    df['round_lng'] = df['longitude'].round(3)
    
    df_clean = df.drop_duplicates(subset=['norm_name', 'round_lat', 'round_lng'], keep='first').copy()
    df_clean.drop(columns=['norm_name', 'round_lat', 'round_lng'], inplace=True)
    
    print(f"3. Unique Master Records after Deduplication: {len(df_clean)}")

    # Sort records by ID
    df_clean.sort_values(by='id', inplace=True)

    # Save Cleaned Master CSV (UTF-8-SIG)
    output_csv = "data/tri_ton_master_cleaned.csv"
    df_clean.to_csv(output_csv, index=False, encoding="utf-8-sig")
    print(f"4. Saved Cleaned Master CSV: {output_csv}")

    # Save Cleaned Master JSON (UTF-8)
    output_json = "data/tri_ton_master_cleaned.json"
    json_data = df_clean.to_dict(orient="records")
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    print(f"5. Saved Cleaned Master JSON: {output_json}")

    # Summary Report
    print("\n--- PANDAS DATA CLEANING SUMMARY ---")
    print(f"Total Master Records: {len(df_clean)}")
    print(f"Categories Breakdown:\n{df_clean['category'].value_counts().to_string()}")
    print(f"Communes Breakdown:\n{df_clean['commune'].value_counts().to_string()}")
    print("SUCCESS: Pandas Data Cleaning Complete!")

if __name__ == "__main__":
    main()
