from tourism_crawler.normalizer.text import clean_vietnamese_text
from tourism_crawler.normalizer.phone import normalize_phone_number
from tourism_crawler.normalizer.address import normalize_address


def test_clean_vietnamese_text():
    raw = "  Hồ   Tà   Pạ  "
    cleaned = clean_vietnamese_text(raw)
    assert cleaned == "Hồ Tà Pạ"


def test_normalize_phone_number():
    assert normalize_phone_number("0989123456") == "0989123456"
    assert normalize_phone_number("+84989123456") == "0989123456"


def test_normalize_address():
    res = normalize_address("Núi Tô, Tri Tôn")
    assert res["district"] == "Tri Tôn"
    assert res["province"] == "An Giang"
