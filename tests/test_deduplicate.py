from tourism_crawler.deduplicate.similarity import is_duplicate, haversine_distance, matches_known_alias


def test_haversine_distance():
    # Distance between same coords should be 0
    dist = haversine_distance(10.4216, 105.0118, 10.4216, 105.0118)
    assert dist < 1.0


def test_is_duplicate():
    rec1 = {"name": "Hồ Tà Pạ", "latitude": 10.4216, "longitude": 105.0118}
    rec2 = {"name": "Hồ Tà Pạ Tuyệt Tình Cốc", "latitude": 10.4217, "longitude": 105.0119}
    assert is_duplicate(rec1, rec2) is True


def test_ho_ta_pa_alias_tuyet_tinh_coc_regression():
    """Regression proof: 'Hồ Tà Pạ' matches famous alias 'Tuyệt Tình Cốc An Giang' within proximity."""
    canonical = {"name": "Hồ Tà Pạ", "latitude": 10.4216, "longitude": 105.0118}
    alias1 = {"name": "Tuyệt Tình Cốc An Giang", "latitude": 10.4218, "longitude": 105.0120}
    alias2 = {"name": "Tuyệt Tình Cốc Tà Pạ", "latitude": 10.4215, "longitude": 105.0117}
    alias3 = {"name": "Hồ Đá Tà Pạ (Tuyệt Tình Cốc)", "latitude": 10.42165, "longitude": 105.01185}

    assert is_duplicate(canonical, alias1) is True
    assert is_duplicate(canonical, alias2) is True
    assert is_duplicate(canonical, alias3) is True


def test_ho_ta_pa_negative_controls():
    """Negative proof: Nearby but distinct attractions on Ta Pa hill are NOT collapsed."""
    lake = {"name": "Hồ Tà Pạ", "latitude": 10.4216, "longitude": 105.0118}
    pagoda = {"name": "Chùa Tà Pạ", "latitude": 10.4230, "longitude": 105.0145}
    distant_lake = {"name": "Hồ Soài So", "latitude": 10.3800, "longitude": 104.9800}

    assert is_duplicate(lake, pagoda) is False
    assert is_duplicate(lake, distant_lake) is False
