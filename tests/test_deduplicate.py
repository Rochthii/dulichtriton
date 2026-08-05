from tourism_crawler.deduplicate.similarity import is_duplicate, haversine_distance


def test_haversine_distance():
    # Distance between same coords should be 0
    dist = haversine_distance(10.4216, 105.0118, 10.4216, 105.0118)
    assert dist < 1.0


def test_is_duplicate():
    rec1 = {"name": "Hồ Tà Pạ", "latitude": 10.4216, "longitude": 105.0118}
    rec2 = {"name": "Hồ Tà Pạ Tuyệt Tình Cốc", "latitude": 10.4217, "longitude": 105.0119}
    assert is_duplicate(rec1, rec2) is True
