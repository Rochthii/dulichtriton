from typing import Tuple

CATEGORY_MAP = {
    "hồ": ("Hồ nước", "Điểm check-in thiên nhiên"),
    "núi": ("Núi", "Trekking & Săn mây"),
    "chùa": ("Chùa Khmer", "Văn hóa - Tâm linh"),
    "đồi": ("Khu sinh thái / Di tích", "Di tích lịch sử"),
    "cây thốt nốt": ("Điểm check-in", "Biểu tượng du lịch"),
    "gà đốt": ("Ẩm thực đặc sản", "Quán ăn Khmer"),
    "cà phê": ("Quán Cà Phê", "Cafe View Đẹp"),
    "homestay": ("Lưu trú", "Homestay & Resort")
}


def normalize_category(name: str, raw_category: str) -> Tuple[str, str]:
    """Classify category and subcategory based on entity name and keywords."""
    combined = f"{name} {raw_category}".lower()
    for kw, (cat, subcat) in CATEGORY_MAP.items():
        if kw in combined:
            return cat, subcat
    return "Địa điểm du lịch", "Điểm tham quan chung"
