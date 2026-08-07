import os
import json
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

HOT_TOP_12 = {
    "PL001": { "hot_rank": 1, "golden_time": ["05:30–07:00", "16:00–17:30"], "hot_score": 22090 },
    "PL010": { "hot_rank": 2, "golden_time": ["07:00–16:00"], "hot_score": 23920 },
    "CK010": { "hot_rank": 3, "golden_time": ["06:00–08:00", "16:00–17:30"], "hot_score": 18096 },
    "EV001": { "hot_rank": 4, "golden_time": ["14:00–17:00 (Mùa Sene Dolta T9–T10)"], "hot_score": 12250 },
    "CK001": { "hot_rank": 5, "golden_time": ["16:00–17:30"], "hot_score": 10290 },
    "CK009": { "hot_rank": 6, "golden_time": ["06:00–08:00"], "hot_score": 16215 },
    "PL004": { "hot_rank": 7, "golden_time": ["11:00–14:00 (Gà đốt Ô Thum)"], "hot_score": 8694 },
    "HG002": { "hot_rank": 8, "golden_time": ["08:00–10:00"], "hot_score": 10272 },
    "PL011": { "hot_rank": 9, "golden_time": ["06:30–09:00 (Mùa vàng T9–T11)"], "hot_score": 7200 },
    "FD006": { "hot_rank": 10, "golden_time": ["12:00–19:00 (Mở từ 12h)"], "hot_score": 8064 },
    "FD011": { "hot_rank": 11, "golden_time": ["07:00–18:00"], "hot_score": 5520 },
    "PL020": { "hot_rank": 12, "golden_time": ["16:00–18:30"], "hot_score": 5520 }
}

def main():
    print("=== SEEDING HOT PLACES METADATA INTO MASTER DATASET ===")
    
    json_path = "data/tri_ton_master_cleaned.json"
    if not os.path.exists(json_path):
        print(f"ERROR: {json_path} not found")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        places = json.load(f)

    hot_count = 0
    for place in places:
        rec_id = place.get("id")
        if rec_id in HOT_TOP_12:
            info = HOT_TOP_12[rec_id]
            place["is_hot"] = True
            place["hot_rank"] = info["hot_rank"]
            place["golden_time_windows"] = info["golden_time"]
            place["hot_score"] = info["hot_score"]
            hot_count += 1
        else:
            place["is_hot"] = False
            place["hot_rank"] = 99
            place["golden_time_windows"] = []
            place["hot_score"] = round(float(place.get("rating", 4.5)) * int(place.get("review_count", 100)), 1)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(places, f, ensure_ascii=False, indent=2)

    print(f"SUCCESS: Tagged {hot_count} Hot Places in {json_path}!")

if __name__ == "__main__":
    main()
