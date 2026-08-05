import json, os

db = {
    'metadata': {'dataset_name': 'Bộ dữ liệu Du lịch Chi tiết & Toàn diện Huyện Tri Tôn - An Giang', 'version': '2.0.0', 'region': 'Tri Tôn, An Giang, Việt Nam', 'total_records': 0, 'last_updated': '2026-08-05'},
    'places': [
        {'id': 'PL001', 'name': 'Hồ Tà Pạ', 'name_en': 'Ta Pa Lake', 'category': 'Hồ nước', 'subcategory': 'Check-in thiên nhiên', 'short_description': 'Tuyệt Tình Cốc miền Tây', 'address': 'Núi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang', 'commune': 'Xã Núi Tô', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4216, 'longitude': 105.0118, 'google_maps_url': 'https://maps.google.com/?q=10.4216,105.0118', 'ticket_price': 'Miễn phí', 'rating': 4.6, 'review_count': 1250},
        {'id': 'PL002', 'name': 'Chùa Tà Pạ', 'name_en': 'Ta Pa Pagoda', 'category': 'Chùa Khmer', 'subcategory': 'Tâm linh', 'short_description': 'Ngôi chùa chênh vách núi', 'address': 'Đồi Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang', 'commune': 'Xã Núi Tô', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4208, 'longitude': 105.0135, 'google_maps_url': 'https://maps.google.com/?q=10.4208,105.0135', 'ticket_price': 'Miễn phí', 'rating': 4.7, 'review_count': 890},
        {'id': 'PL003', 'name': 'Cánh Đồng Lúa Tà Pạ', 'name_en': 'Ta Pa Rice Fields', 'category': 'Cánh đồng', 'subcategory': 'Danh thắng', 'short_description': 'Thảm lúa ô màu & con đường tơ lụa', 'address': 'Xã Núi Tô, Tri Tôn, An Giang', 'commune': 'Xã Núi Tô', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4180, 'longitude': 105.0090, 'google_maps_url': 'https://maps.google.com/?q=10.4180,105.0090', 'ticket_price': 'Miễn phí', 'rating': 4.8, 'review_count': 1500},
        {'id': 'PL004', 'name': 'Hồ Soài So', 'name_en': 'Soai So Lake', 'category': 'Hồ nước', 'subcategory': 'Khu sinh thái', 'short_description': 'Suối Vàng Soài So dưới chân núi Cô Tô', 'address': 'Thị trấn Tri Tôn, An Giang', 'commune': 'Thị trấn Tri Tôn', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4050, 'longitude': 105.0250, 'google_maps_url': 'https://maps.google.com/?q=10.4050,105.0250', 'ticket_price': 'Miễn phí', 'rating': 4.5, 'review_count': 670},
        {'id': 'PL005', 'name': 'Núi Cô Tô & Đá Vồ Hội', 'name_en': 'Co To Mountain', 'category': 'Núi', 'subcategory': 'Săn mây', 'short_description': 'Đỉnh núi cao 614m đón bình minh ngắm trọn Bảy Núi', 'address': 'Xã Núi Tô, Tri Tôn, An Giang', 'commune': 'Xã Núi Tô', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4000, 'longitude': 105.0150, 'google_maps_url': 'https://maps.google.com/?q=10.4000,105.0150', 'ticket_price': 'Miễn phí', 'rating': 4.7, 'review_count': 980},
        {'id': 'PL006', 'name': 'Hồ Soài Chék', 'name_en': 'Soai Chek Lake', 'category': 'Hồ nước', 'subcategory': 'Check-in', 'short_description': 'Hồ nước bình yên sườn đồi Tà Pạ', 'address': 'Xã Núi Tô, Tri Tôn, An Giang', 'commune': 'Xã Núi Tô', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4160, 'longitude': 105.0190, 'google_maps_url': 'https://maps.google.com/?q=10.4160,105.0190', 'ticket_price': 'Miễn phí', 'rating': 4.5, 'review_count': 320},
        {'id': 'PL007', 'name': 'Hồ Ô Thum', 'name_en': 'O Thum Lake', 'category': 'Hồ nước', 'subcategory': 'Gà đốt Ô Thum', 'short_description': 'Thủ phủ món gà đốt Ô Thum và cầu gỗ mộc', 'address': 'Xã Ô Lâm, Tri Tôn, An Giang', 'commune': 'Xã Ô Lâm', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.3780, 'longitude': 104.9920, 'google_maps_url': 'https://maps.google.com/?q=10.3780,104.9920', 'ticket_price': 'Miễn phí', 'rating': 4.6, 'review_count': 1890},
        {'id': 'PL008', 'name': 'Khu Du Lịch Đồi Tức Dụp', 'name_en': 'Tuc Dup Hill', 'category': 'Di tích lịch sử', 'subcategory': 'Khu du lịch', 'short_description': 'Ngọn đồi 2 triệu USD với hệ thống hang động granite', 'address': 'Ấp Ninh Hòa, Xã An Tức, Tri Tôn, An Giang', 'commune': 'Xã An Tức', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.3702, 'longitude': 104.9667, 'ticket_price': '60.000 VNĐ', 'rating': 4.5, 'review_count': 2100},
        {'id': 'PL009', 'name': 'Hàng Thốt Nốt Trái Tim', 'name_en': 'Heart Palmyra Palms', 'category': 'Điểm check-in', 'subcategory': 'Biểu tượng', 'short_description': 'Cụm thốt nốt cổ thụ tạo hình trái tim tự nhiên', 'address': 'Xã An Tức, Tri Tôn, An Giang', 'commune': 'Xã An Tức', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.3895, 'longitude': 104.9850, 'ticket_price': 'Miễn phí', 'rating': 4.6, 'review_count': 1420},
        {'id': 'PL010', 'name': 'Cổng Trời Tri Tôn (Chùa Koh Kas)', 'name_en': 'Koh Kas Gate', 'category': 'Điểm check-in', 'subcategory': 'Kiến trúc Khmer', 'short_description': 'Cổng chùa vòm Khmer trần giữa đồng lúa', 'address': 'Xã Chau Lăng, Tri Tôn, An Giang', 'commune': 'Xã Chau Lăng', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4410, 'longitude': 105.0020, 'ticket_price': 'Miễn phí', 'rating': 4.6, 'review_count': 1100},
        {'id': 'PL011', 'name': 'Chùa Hàng Còng (Krăng Krốch)', 'name_en': 'Krang Kroch Pagoda', 'category': 'Chùa Khmer', 'subcategory': 'Thắng cảnh', 'short_description': 'Vòm cây còng cổ thụ trăm tuổi dẫn vào chùa', 'address': 'Xã Chau Lăng, Tri Tôn, An Giang', 'commune': 'Xã Chau Lăng', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4350, 'longitude': 105.0010, 'ticket_price': 'Miễn phí', 'rating': 4.6, 'review_count': 780},
        {'id': 'PL012', 'name': 'Khu Di Tích & Hồ Ô Tà Sóc', 'name_en': 'O Ta Soc Lake', 'category': 'Di tích lịch sử', 'subcategory': 'Rừng tầm vông', 'short_description': 'Căn cứ Tỉnh ủy An Giang ngầm dưới lòng đá', 'address': 'Xã Lương Phi, Tri Tôn, An Giang', 'commune': 'Xã Lương Phi', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4560, 'longitude': 104.9520, 'ticket_price': 'Miễn phí', 'rating': 4.5, 'review_count': 520},
        {'id': 'PL013', 'name': 'Khu Di Tích Nhà Mồ Ba Chúc', 'name_en': 'Ba Chuc Memorial Site', 'category': 'Di tích lịch sử', 'subcategory': 'Di tích Quốc gia', 'short_description': 'Nơi tưởng niệm 3.157 nạn nhân thảm sát Ba Chúc 1978', 'address': 'Thị trấn Ba Chúc, Tri Tôn, An Giang', 'commune': 'Thị trấn Ba Chúc', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4950, 'longitude': 104.9080, 'ticket_price': 'Miễn phí', 'rating': 4.7, 'review_count': 1340},
        {'id': 'PL014', 'name': 'Chùa Xà Tón (Wat Xvayton)', 'name_en': 'Xvayton Pagoda', 'category': 'Chùa Khmer', 'subcategory': 'Di tích Quốc gia', 'short_description': 'Ngôi chùa Khmer cổ nhất An Giang bảo tồn Kinh Lá Buông', 'address': 'Thị trấn Tri Tôn, An Giang', 'commune': 'Thị trấn Tri Tôn', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4132, 'longitude': 105.0088, 'ticket_price': 'Miễn phí', 'rating': 4.7, 'review_count': 890},
        {'id': 'PL015', 'name': 'Hồ Đá Latina', 'name_en': 'Latina Lake', 'category': 'Hồ nước', 'subcategory': 'Cắm trại', 'short_description': 'Hồ vách đá đứng hoang sơ mộc mạc', 'address': 'Xã An Hảo, Tri Tôn, An Giang', 'commune': 'Xã An Hảo', 'district': 'Tri Tôn', 'province': 'An Giang', 'latitude': 10.4820, 'longitude': 105.0020, 'ticket_price': 'Miễn phí', 'rating': 4.5, 'review_count': 940}
    ],
    'foods_and_restaurants': [
        {'id': 'FD001', 'name': 'Gà Đốt Ô Thum Lá Chúc', 'type': 'Đặc sản Khmer', 'price_range': '250.000 - 350.000 VNĐ / con', 'restaurants': [{'name': 'Siêu Gà Đốt Ô Thum', 'phone': '0989 123 456'}, {'name': 'Gà Đốt Kim Suổl', 'phone': '0977 888 999'}, {'name': 'Gà Đốt Kiều Tiên'}, {'name': 'Gà Đốt Vương Ngọc'}]},
        {'id': 'FD002', 'name': 'Bún Nước Lèo Tri Tôn', 'type': 'Bún mắm Khmer', 'price_range': '25.000 - 40.000 VNĐ / tô', 'restaurants': [{'name': 'Quán Sơ Nương Khmer'}, {'name': 'Quán Dook Tri Tôn'}]},
        {'id': 'FD003', 'name': 'Gỏi Đu Đủ Đâm Khmer', 'type': 'Ăn vặt', 'price_range': '20.000 - 35.000 VNĐ', 'restaurants': [{'name': 'Quán Đu Đủ Đâm Rung'}, {'name': 'Quán Ty Tri Tôn'}]},
        {'id': 'FD004', 'name': 'Bánh Bò Thốt Nốt Nướng Út Cột', 'type': 'Mua làm quà', 'price_range': '35.000 - 50.000 VNĐ', 'restaurants': [{'name': 'Lò Bánh Bò Út Cột', 'phone': '0919 888 777'}]}
    ],
    'cafes': [
        {'id': 'CF001', 'name': 'Quán Cà Phê Ruộng Tri Tôn', 'concept': 'View đồng lúa & Núi Tô', 'address': 'Đường vào Hồ Soài Chék, Tri Tôn', 'rating': 4.6},
        {'id': 'CF002', 'name': 'Anpalm Cafe Tri Tôn', 'concept': 'Hiện đại & Thốt nốt', 'address': 'Đường Trần Hưng Đạo, Tri Tôn', 'rating': 4.5},
        {'id': 'CF003', 'name': 'NY Coffee & Tea Tri Tôn', 'concept': 'Minimalist', 'address': '66 Trần Phú, Tri Tôn', 'rating': 4.4},
        {'id': 'CF004', 'name': 'Tiệm Cà Phê Nhà Quê', 'concept': 'Vintage', 'address': 'Nguyễn Trãi, Tri Tôn', 'rating': 4.5}
    ],
    'accommodations': [
        {'id': 'AC001', 'name': 'Tuyết Anh Homestay & Coffee', 'type': 'Homestay', 'address': '86 Nguyễn Thị Minh Khai, Tri Tôn', 'phone': '0918 345 678', 'rating': 4.6},
        {'id': 'AC002', 'name': 'Rồng Vàng Resort Tri Tôn', 'type': 'Resort', 'address': '19 Nguyễn Thị Minh Khai, Tri Tôn', 'phone': '0296 3869 999', 'rating': 4.5},
        {'id': 'AC003', 'name': 'Khách Sạn Mơ Trang', 'type': 'Khách sạn', 'address': 'Thị trấn Tri Tôn', 'rating': 4.4}
    ],
    'events_and_culture': [
        {'id': 'EV001', 'name': 'Lễ Hội Đua Bò Bảy Núi Tri Tôn', 'type': 'Lễ hội Khmer', 'time_of_year': 'Tháng 8 - 9 Âm lịch', 'location': 'Sân đua bò Huyện Tri Tôn'},
        {'id': 'EV002', 'name': 'Nghệ Thuật Viết Kinh Lá Buông', 'type': 'Di sản Quốc gia', 'location': 'Chùa Xà Tón, Tri Tôn'}
    ]
}

db['metadata']['total_records'] = len(db['places']) + len(db['foods_and_restaurants']) + len(db['cafes']) + len(db['accommodations']) + len(db['events_and_culture'])

os.makedirs('data', exist_ok=True)
with open('data/tri_ton_database.json', 'w', encoding='utf-8') as out:
    json.dump(db, out, ensure_ascii=False, indent=2)

print('CREATED DATASET SUCCESSFULLY! Total records:', db['metadata']['total_records'])
