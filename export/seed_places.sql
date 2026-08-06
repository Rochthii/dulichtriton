-- ====================================================================
-- DU LICH TRI TON - PRODUCTION MASTER SEED DATA (106 LOCATIONS)
-- ====================================================================
BEGIN;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL001', 'PL001', 'Hồ Tà Pạ (Tuyệt Tình Cốc)', 'hồ-tà-pạ-tuyệt-tình-cốc-pl001',
    'Hồ nước', 'Hồ nước', '',
    'Núi Tà Pạ, Ấp Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.4216, 105.0118,
    '06:00 - 18:00', 'Miễn phí', 4.6, 1850,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL002', 'PL002', 'Hồ Soài So', 'hồ-soài-so-pl002',
    'Hồ nước', 'Hồ nước', '',
    'Khu du lịch Soài So, Chân núi Cô Tô, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.405, 105.025,
    '06:00 - 18:00', 'Miễn phí', 4.5, 670,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL003', 'PL003', 'Hồ Soài Chék', 'hồ-soài-chék-pl003',
    'Hồ nước', 'Hồ nước', '',
    'Ven hồ Soài Chék, Ấp Kè Sen, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.416, 105.019,
    '06:00 - 18:00', 'Miễn phí', 4.5, 320,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL004', 'PL004', 'Hồ Ô Thum', 'hồ-ô-thum-pl004',
    'Hồ nước', 'Hồ nước', '',
    'Khu vực Hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.378, 104.992,
    '07:00 - 20:00', 'Miễn phí', 4.6, 1890,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL005', 'PL005', 'Hồ Ô Tà Sóc', 'hồ-ô-tà-sóc-pl005',
    'Hồ nước', 'Hồ nước', '',
    'Khu di tích Ô Tà Sóc, Ấp Ninh Phước, Xã Lương Phi, Tri Tôn, An Giang', 'Xã Lương Phi', 10.456, 104.952,
    '07:00 - 17:00', 'Miễn phí', 4.5, 520,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL006', 'PL006', 'Hồ Ô Tà Lọt', 'hồ-ô-tà-lọt-pl006',
    'Hồ nước', 'Hồ nước', '',
    'Khu vực Hồ Ô Tà Lọt, Dưới chân Núi Dài, Xã An Hảo, Tri Tôn, An Giang', 'Xã An Hảo', 10.478, 104.962,
    '07:00 - 17:00', 'Miễn phí', 4.5, 290,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL007', 'PL007', 'Hồ Đá Latina', 'hồ-đá-latina-pl007',
    'Hồ nước', 'Hồ nước', '',
    'Khu vực Vách đá Latina, Dưới chân Núi Cấm, Xã An Hảo, Tri Tôn, An Giang', 'Xã An Hảo', 10.482, 105.002,
    'Tự do', 'Miễn phí', 4.5, 940,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL008', 'PL008', 'Núi Cô Tô (Phụng Hoàng Sơn)', 'núi-cô-tô-phụng-hoàng-sơn-pl008',
    'Núi', 'Núi', '',
    'Dãy núi Cô Tô (Phụng Hoàng Sơn), Ấp Tô Thuận, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.4, 105.015,
    'Tự do', 'Miễn phí', 4.7, 1120,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL009', 'PL009', 'Đá Vồ Hội Mẹ Cô Tô', 'đá-vồ-hội-mẹ-cô-tô-pl009',
    'Săn mây', 'Săn mây', '',
    'Đỉnh Núi Cô Tô, Ấp Tô Thuận, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.401, 105.016,
    'Tự do', 'Miễn phí', 4.8, 890,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL010', 'PL010', 'Khu Du Lịch Đồi Tức Dụp', 'khu-du-lịch-đồi-tức-dụp-pl010',
    'Di tích lịch sử', 'Di tích lịch sử', '',
    'Khu du lịch Đồi Tức Dụp, Ấp Ninh Hòa, Xã An Tức, Tri Tôn, An Giang', 'Xã An Tức', 10.3702, 104.9667,
    '07:00 - 17:00', '60.000 VNĐ', 4.5, 2100,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL011', 'PL011', 'Cánh Đồng Lúa Tà Pạ', 'cánh-đồng-lúa-tà-pạ-pl011',
    'Cánh đồng', 'Cánh đồng', '',
    'Cánh đồng lúa Tà Pạ, Ấp Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.418, 105.009,
    'Tự do', 'Miễn phí', 4.8, 1500,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL012', 'PL012', 'Rừng Tầm Vông Ô Tà Sóc', 'rừng-tầm-vông-ô-tà-sóc-pl012',
    'Rừng sinh thái', 'Rừng sinh thái', '',
    'Rừng tầm vông Ô Tà Sóc, Ấp Ninh Phước, Xã Lương Phi, Tri Tôn, An Giang', 'Xã Lương Phi', 10.457, 104.953,
    '07:00 - 17:00', 'Miễn phí', 4.6, 410,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL013', 'PL013', 'Cánh Đồng Lúa Ba Chúc', 'cánh-đồng-lúa-ba-chúc-pl013',
    'Cánh đồng', 'Cánh đồng', '',
    'Cánh đồng lúa Ba Chúc, Ấp An Bình, Thị trấn Ba Chúc, Tri Tôn, An Giang', 'Thị trấn Ba Chúc', 10.493, 104.905,
    'Tự do', 'Miễn phí', 4.6, 350,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL014', 'PL014', 'Vườn Nho Nông Trại Ô Thum', 'vườn-nho-nông-trại-ô-thum-pl014',
    'Nông trại', 'Nông trại', '',
    'Vườn nho nông trại Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.3782, 104.9912,
    '07:30 - 17:30', '10.000 VNĐ', 4.5, 520,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL015', 'PL015', 'Vườn Mãng Cầu Núi Tô', 'vườn-mãng-cầu-núi-tô-pl015',
    'Nông trại', 'Nông trại', '',
    'Vườn mãng cầu sườn Núi Tô, Ấp Tô Thuận, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.408, 105.021,
    '07:00 - 17:00', 'Miễn phí', 4.5, 280,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL016', 'PL016', 'Suối Vàng Soài So', 'suối-vàng-soài-so-pl016',
    'Suối sinh thái', 'Suối sinh thái', '',
    'Khu vực Suối Vàng Soài So, Khóm 1, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4055, 105.0255,
    '07:00 - 17:00', 'Miễn phí', 4.5, 430,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL017', 'PL017', 'Núi Dài (Ngọa Long Sơn)', 'núi-dài-ngọa-long-sơn-pl017',
    'Núi', 'Núi', '',
    'Dãy Núi Dài (Ngọa Long Sơn), Ấp Ninh Phước, Xã Lương Phi, Tri Tôn, An Giang', 'Xã Lương Phi', 10.45, 104.94,
    'Tự do', 'Miễn phí', 4.6, 390,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL018', 'PL018', 'Cánh Đồng Thốt Nốt Chau Lăng', 'cánh-đồng-thốt-nốt-chau-lăng-pl018',
    'Cánh đồng', 'Cánh đồng', '',
    'Cánh đồng thốt nốt Chau Lăng, Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.437, 105.003,
    'Tự do', 'Miễn phí', 4.6, 610,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL019', 'PL019', 'Vách Đá Đứng Latina', 'vách-đá-đứng-latina-pl019',
    'Check-in thiên nhiên', 'Check-in thiên nhiên', '',
    'Vách đá đứng Latina, Dưới chân Núi Cấm, Xã An Hảo, Tri Tôn, An Giang', 'Xã An Hảo', 10.4825, 105.0025,
    'Tự do', 'Miễn phí', 4.6, 480,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'PL020', 'PL020', 'Bãi Thả Diều Hoàng Hôn Tri Tôn', 'bãi-thả-diều-hoàng-hôn-tri-tôn-pl020',
    'Tọa độ chill hoàng hôn', 'Tọa độ chill hoàng hôn', '',
    'Sân đua bò Tri Tôn, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4122, 105.0082,
    '16:00 - 18:30', 'Miễn phí', 4.8, 1150,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK001', 'CK001', 'Con Đường Tuyến Tránh Tri Tôn (ĐT941 - ĐT948)', 'con-đường-tuyến-tránh-tri-tôn-đt941---đt948-ck001',
    'Cung đường ngắm núi Cô Tô chill nhất An Giang', 'Cung đường ngắm núi Cô Tô chill nhất An Giang', '',
    'Tuyến đường tránh ĐT941 - ĐT948, Khóm 6, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.419, 105.012,
    'Tự do (Chiều 16:00 - 17:30 đẹp nhất)', 'Miễn phí', 4.9, 2100,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK002', 'CK002', 'Con Đường Tơ Lụa Tà Pạ', 'con-đường-tơ-lụa-tà-pạ-ck002',
    'Con đường tơ lụa', 'Con đường tơ lụa', '',
    'Tuyến đường lúa Tà Pạ, Ấp Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.4185, 105.0095,
    'Tự do', 'Miễn phí', 4.8, 1280,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK003', 'CK003', 'Con Đường Tơ Lụa Soài Chék', 'con-đường-tơ-lụa-soài-chék-ck003',
    'Con đường tơ lụa', 'Con đường tơ lụa', '',
    'Cung đường ven hồ Soài Chék, Ấp Kè Sen, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.4162, 105.0188,
    'Tự do', 'Miễn phí', 4.7, 890,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK004', 'CK004', 'Con Đường Vòm Còng Chau Lăng', 'con-đường-vòm-còng-chau-lăng-ck004',
    'Con đường nhiếp ảnh', 'Con đường nhiếp ảnh', '',
    'Tuyến đường Hàng Còng, Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.4355, 105.0015,
    'Tự do', 'Miễn phí', 4.7, 940,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK005', 'CK005', 'Con Đường Thốt Nốt Ô Lâm - Cô Tô', 'con-đường-thốt-nốt-ô-lâm---cô-tô-ck005',
    'Con đường nhiếp ảnh', 'Con đường nhiếp ảnh', '',
    'Tuyến đường liên xã Ô Lâm - Núi Tô, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.38, 104.995,
    'Tự do', 'Miễn phí', 4.6, 720,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK006', 'CK006', 'Con Đường Tre Tầm Vông Ô Tà Sóc', 'con-đường-tre-tầm-vông-ô-tà-sóc-ck006',
    'Con đường nhiếp ảnh', 'Con đường nhiếp ảnh', '',
    'Đường tầm vông Ô Tà Sóc, Ấp Ninh Phước, Xã Lương Phi, Tri Tôn, An Giang', 'Xã Lương Phi', 10.4565, 104.9525,
    'Tự do', 'Miễn phí', 4.7, 610,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK007', 'CK007', 'Cung Đường Ven Vách Đá Núi Dài (Lương Phi)', 'cung-đường-ven-vách-đá-núi-dài-lương-phi-ck007',
    'Cung đường phượt ngắm núi', 'Cung đường phượt ngắm núi', '',
    'Tuyến đường ven núi Lương Phi - Lê Trì, Xã Lương Phi, Tri Tôn, An Giang', 'Xã Lương Phi', 10.458, 104.945,
    'Tự do', 'Miễn phí', 4.7, 540,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK008', 'CK008', 'Cung Đường Biên Giới Kênh Vĩnh Tế (Ba Chúc)', 'cung-đường-biên-giới-kênh-vĩnh-tế-ba-chúc-ck008',
    'Cung đường biên giới', 'Cung đường biên giới', '',
    'Tuyến đường biên giới kênh Vĩnh Tế, Thị trấn Ba Chúc, Tri Tôn, An Giang', 'Thị trấn Ba Chúc', 10.498, 104.901,
    'Tự do', 'Miễn phí', 4.7, 680,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK009', 'CK009', 'Hàng Thốt Nốt Trái Tim An Tức', 'hàng-thốt-nốt-trái-tim-an-tức-ck009',
    'Điểm check-in biểu tượng', 'Điểm check-in biểu tượng', '',
    'Cụm thốt nốt trái tim, Ấp Ninh Hòa, Xã An Tức, Tri Tôn, An Giang', 'Xã An Tức', 10.3895, 104.985,
    'Tự do', 'Miễn phí', 4.7, 1560,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK010', 'CK010', 'Cổng Trời Tri Tôn Vòm Khmer', 'cổng-trời-tri-tôn-vòm-khmer-ck010',
    'Điểm check-in biểu tượng', 'Điểm check-in biểu tượng', '',
    'Cổng chùa Koh Kas, Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.441, 105.002,
    'Tự do', 'Miễn phí', 4.7, 1320,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK011', 'CK011', 'Cây Thốt Nốt Cô Độc Chau Lăng', 'cây-thốt-nốt-cô-độc-chau-lăng-ck011',
    'Điểm check-in độc đáo', 'Điểm check-in độc đáo', '',
    'Cây thốt nốt cô độc, Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.439, 105.0035,
    'Tự do', 'Miễn phí', 4.6, 540,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK012', 'CK012', 'Cầu Gỗ Mộc Mạc Hồ Ô Thum', 'cầu-gỗ-mộc-mạc-hồ-ô-thum-ck012',
    'Điểm check-in sống ảo', 'Điểm check-in sống ảo', '',
    'Lòng hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.378, 104.992,
    'Tự do', 'Miễn phí', 4.6, 890,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK013', 'CK013', 'Cầu Gỗ Giữa Đồng Lúa Ruộng Coffee', 'cầu-gỗ-giữa-đồng-lúa-ruộng-coffee-ck013',
    'Điểm check-in sống ảo', 'Điểm check-in sống ảo', '',
    'Sân vườn Ruộng Coffee, Ấp Kè Sen, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.4152, 105.0182,
    '06:30 - 18:30', 'Miễn phí', 4.7, 780,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK014', 'CK014', 'Đá Vồ Hội Đổ (Mỏm Đá Sống Ảo)', 'đá-vồ-hội-đổ-mỏm-đá-sống-ảo-ck014',
    'Tọa độ săn ảnh đỉnh núi', 'Tọa độ săn ảnh đỉnh núi', '',
    'Đá Vồ Hội Đổ, Đỉnh Núi Cô Tô, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.4015, 105.0165,
    'Tự do', 'Miễn phí', 4.8, 920,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK015', 'CK015', 'Cầu Cây Dã Ngoại Hồ Soài So', 'cầu-cây-dã-ngoại-hồ-soài-so-ck015',
    'Điểm check-in ven hồ', 'Điểm check-in ven hồ', '',
    'Cầu cây Hồ Soài So, Khóm 1, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4052, 105.0252,
    'Tự do', 'Miễn phí', 4.5, 410,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK016', 'CK016', 'Nấc Thang Thiên Đường Kiều Tiên Ô Thum', 'nấc-thang-thiên-đường-kiều-tiên-ô-thum-ck016',
    'Tiểu cảnh check-in', 'Tiểu cảnh check-in', '',
    'Khuôn viên Kiều Tiên Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.3776, 104.9926,
    '08:00 - 19:00', 'Miễn phí', 4.5, 460,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK017', 'CK017', 'Căn Nhà Gỗ Vintage Nhà Quê', 'căn-nhà-gỗ-vintage-nhà-quê-ck017',
    'Góc chụp Đà Lạt', 'Góc chụp Đà Lạt', '',
    'Căn nhà gỗ Vintage, Khóm 4, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4112, 105.0052,
    '06:30 - 21:00', 'Miễn phí', 4.6, 520,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK018', 'CK018', 'Cầu Khỉ Giữa Cánh Đồng Thốt Nốt', 'cầu-khỉ-giữa-cánh-đồng-thốt-nốt-ck018',
    'Điểm check-in mộc mạc', 'Điểm check-in mộc mạc', '',
    'Cánh đồng thốt nốt An Tức, Ấp Ninh Hòa, Xã An Tức, Tri Tôn, An Giang', 'Xã An Tức', 10.388, 104.986,
    'Tự do', 'Miễn phí', 4.6, 380,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK019', 'CK019', 'Quầy Thốt Nốt Tươi Cụm Trái Tim', 'quầy-thốt-nốt-tươi-cụm-trái-tim-ck019',
    'Góc giải khát chill', 'Góc giải khát chill', '',
    'Quầy nước thốt nốt tươi, Ấp Ninh Hòa, Xã An Tức, Tri Tôn, An Giang', 'Xã An Tức', 10.3896, 104.9851,
    '07:00 - 18:00', '10k - 20k', 4.7, 640,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CK020', 'CK020', 'Biển Hiệu Ở Đây Không Có Gì Ngoài Ký Ức', 'biển-hiệu-ở-đây-không-có-gì-ngoài-ký-ức-ck020',
    'Góc ảnh Việt phục cổ trang', 'Góc ảnh Việt phục cổ trang', '',
    'Đường Nam Kỳ Khởi Nghĩa, Khóm 2, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4062, 105.0232,
    '07:00 - 21:00', 'Miễn phí', 4.7, 420,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'HG001', 'HG001', 'Chùa Tà Pạ (Chùa Núi)', 'chùa-tà-pạ-chùa-núi-hg001',
    'Chùa Khmer', 'Chùa Khmer', '',
    'Ngọn đồi Tà Pạ, Ấp Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.4208, 105.0135,
    '06:00 - 18:00', 'Miễn phí', 4.7, 890,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'HG002', 'HG002', 'Chùa Xà Tón (Wat Xvayton)', 'chùa-xà-tón-wat-xvayton-hg002',
    'Chùa Khmer cổ', 'Chùa Khmer cổ', '',
    'Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4132, 105.0088,
    '06:00 - 18:00', 'Miễn phí', 4.7, 890,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'HG003', 'HG003', 'Chùa Hàng Còng (Krăng Krốch)', 'chùa-hàng-còng-krăng-krốch-hg003',
    'Chùa Khmer cổ', 'Chùa Khmer cổ', '',
    'Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.435, 105.001,
    '06:00 - 18:00', 'Miễn phí', 4.6, 780,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'HG004', 'HG004', 'Chùa Cổng Trời Koh Kas', 'chùa-cổng-trời-koh-kas-hg004',
    'Chùa Khmer', 'Chùa Khmer', '',
    'Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.441, 105.002,
    '06:00 - 18:00', 'Miễn phí', 4.6, 1320,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'HG005', 'HG005', 'Khu Di Tích Nhà Mồ Ba Chúc', 'khu-di-tích-nhà-mồ-ba-chúc-hg005',
    'Di tích Quốc gia', 'Di tích Quốc gia', '',
    'Ấp An Bình, Thị trấn Ba Chúc, Tri Tôn, An Giang', 'Thị trấn Ba Chúc', 10.495, 104.908,
    '07:00 - 17:00', 'Miễn phí', 4.7, 1340,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'HG006', 'HG006', 'Chùa Phi Lai Ba Chúc', 'chùa-phi-lai-ba-chúc-hg006',
    'Chùa tâm linh', 'Chùa tâm linh', '',
    'Ấp An Bình, Thị trấn Ba Chúc, Tri Tôn, An Giang', 'Thị trấn Ba Chúc', 10.4945, 104.9075,
    '06:00 - 18:00', 'Miễn phí', 4.6, 520,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'HG007', 'HG007', 'Chùa Tam Bửu Ba Chúc', 'chùa-tam-bửu-ba-chúc-hg007',
    'Chùa tâm linh', 'Chùa tâm linh', '',
    'Ấp An Bình, Thị trấn Ba Chúc, Tri Tôn, An Giang', 'Thị trấn Ba Chúc', 10.4955, 104.9085,
    '06:00 - 18:00', 'Miễn phí', 4.6, 480,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'HG008', 'HG008', 'Khu Di Tích Căn Cứ Ô Tà Sóc', 'khu-di-tích-căn-cứ-ô-tà-sóc-hg008',
    'Di tích lịch sử', 'Di tích lịch sử', '',
    'Ấp Ninh Phước, Xã Lương Phi, Tri Tôn, An Giang', 'Xã Lương Phi', 10.456, 104.952,
    '07:00 - 17:00', 'Miễn phí', 4.6, 520,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'HG009', 'HG009', 'Chùa Soài So Khmer', 'chùa-soài-so-khmer-hg009',
    'Chùa Khmer', 'Chùa Khmer', '',
    'Chân núi Cô Tô, Khóm 1, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.406, 105.024,
    '06:00 - 18:00', 'Miễn phí', 4.5, 310,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'HG010', 'HG010', 'Chùa Mới Ô Lâm', 'chùa-mới-ô-lâm-hg010',
    'Chùa Khmer', 'Chùa Khmer', '',
    'Ấp Phước Lộc, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.379, 104.993,
    '06:00 - 18:00', 'Miễn phí', 4.5, 270,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD001', 'FD001', 'Quán Siêu Gà Đốt Ô Thum (Chau Siêu)', 'quán-siêu-gà-đốt-ô-thum-chau-siêu-fd001',
    'Gà Đốt Ô Thum', 'Gà Đốt Ô Thum', '',
    'Tỉnh lộ 955B, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.3785, 104.9915,
    '09:00 - 18:00', '250k - 320k', 4.6, 1450,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD002', 'FD002', 'Quán Kiều Tiên Gà Đốt Ô Thum', 'quán-kiều-tiên-gà-đốt-ô-thum-fd002',
    'Gà Đốt Ô Thum', 'Gà Đốt Ô Thum', '',
    'Bờ Hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.3775, 104.9925,
    '08:00 - 19:30', '250k - 330k', 4.5, 920,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD003', 'FD003', 'Gà Đốt Ô Thum Kim Suổl', 'gà-đốt-ô-thum-kim-suổl-fd003',
    'Gà Đốt Ô Thum', 'Gà Đốt Ô Thum', '',
    'Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.379, 104.993,
    '06:00 - 23:00', '260k - 350k', 4.5, 780,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD004', 'FD004', 'Gà Đốt Ô Thum Thảo Nguyên', 'gà-đốt-ô-thum-thảo-nguyên-fd004',
    'Gà Đốt Ô Thum', 'Gà Đốt Ô Thum', '',
    'Bờ Hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.378, 104.991,
    '08:00 - 19:00', '250k - 320k', 4.5, 810,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD005', 'FD005', 'Gà Đốt Vương Ngọc Ô Thum', 'gà-đốt-vương-ngọc-ô-thum-fd005',
    'Gà Đốt Ô Thum', 'Gà Đốt Ô Thum', '',
    'Bờ Hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.377, 104.992,
    '08:00 - 19:00', '250k - 320k', 4.4, 450,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD006', 'FD006', 'Quán Đu Đủ Đâm RiNa Khmer', 'quán-đu-đủ-đâm-rina-khmer-fd006',
    'Đặc sản Khmer', 'Đặc sản Khmer', '',
    'Sóc Phnôm Pi, Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.438, 105.003,
    '12:00 - 19:00', '20k - 35k', 4.8, 1680,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD007', 'FD007', 'Quán Đu Đủ Đâm Ly Ly', 'quán-đu-đủ-đâm-ly-ly-fd007',
    'Đặc sản Khmer', 'Đặc sản Khmer', '',
    'Sóc Phnôm Pi, Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.4385, 105.0035,
    '11:30 - 18:30', '20k - 35k', 4.6, 720,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD008', 'FD008', 'Quán Đu Đủ Đâm Ty Tri Tôn', 'quán-đu-đủ-đâm-ty-tri-tôn-fd008',
    'Đặc sản Khmer', 'Đặc sản Khmer', '',
    'Sóc Phnôm Pi, Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.4375, 105.0025,
    '12:00 - 19:00', '20k - 35k', 4.5, 510,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD009', 'FD009', 'Quán Bún Nước Lèo Sơ Nương Khmer', 'quán-bún-nước-lèo-sơ-nương-khmer-fd009',
    'Bún nước lèo', 'Bún nước lèo', '',
    '45 Đường Trần Hưng Đạo, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.413, 105.007,
    '06:00 - 11:00', '25k - 35k', 4.7, 890,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD010', 'FD010', 'Quán Bún Nước Lèo Dook Tri Tôn', 'quán-bún-nước-lèo-dook-tri-tôn-fd010',
    'Bún nước lèo', 'Bún nước lèo', '',
    '15 Đường Trần Hưng Đạo, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4125, 105.0065,
    '06:00 - 11:00', '25k - 35k', 4.5, 410,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD011', 'FD011', 'Lò Bánh Bò Thốt Nốt Nướng Út Cột', 'lò-bánh-bò-thốt-nốt-nướng-út-cột-fd011',
    'Đặc sản mua quà', 'Đặc sản mua quà', '',
    'Tỉnh Lộ 941, Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.436, 105.004,
    '07:00 - 18:00', '35k - 50k', 4.8, 1150,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD012', 'FD012', 'Lò Bánh Bò Thốt Nốt Út Dứt', 'lò-bánh-bò-thốt-nốt-út-dứt-fd012',
    'Đặc sản mua quà', 'Đặc sản mua quà', '',
    'Tỉnh Lộ 941, Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.4365, 105.0045,
    '07:00 - 18:00', '35k - 50k', 4.6, 580,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD013', 'FD013', 'Quán Bánh Canh Lò Rèn (>30 năm)', 'quán-bánh-canh-lò-rèn->30-năm-fd013',
    'Bánh canh', 'Bánh canh', '',
    '114 Đường Trần Hưng Đạo, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4135, 105.0072,
    '06:00 - 17:00', '30k - 45k', 4.7, 890,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD014', 'FD014', 'Quán Bò 7 Món Ba Chúc', 'quán-bò-7-món-ba-chúc-fd014',
    'Bò 7 món', 'Bò 7 món', '',
    'Tỉnh lộ 955N, Ấp An Bình, Thị trấn Ba Chúc, Tri Tôn, An Giang', 'Thị trấn Ba Chúc', 10.496, 104.909,
    '09:00 - 21:00', '80k - 200k', 4.6, 670,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD015', 'FD015', 'Quán Cháo Bò Trái Trúc Ba Chúc', 'quán-cháo-bò-trái-trúc-ba-chúc-fd015',
    'Cháo bò', 'Cháo bò', '',
    'Tỉnh lộ 955N, Ấp An Bình, Thị trấn Ba Chúc, Tri Tôn, An Giang', 'Thị trấn Ba Chúc', 10.495, 104.908,
    '06:00 - 14:00', '30k - 50k', 4.6, 520,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD016', 'FD016', 'Quán Bánh Xèo Tép Bông Điên Điển Cầu Số 10', 'quán-bánh-xèo-tép-bông-điên-điển-cầu-số-10-fd016',
    'Bánh xèo miền Tây', 'Bánh xèo miền Tây', '',
    'Khu vực Cầu Số 10, Khóm 6, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4115, 105.0055,
    '14:00 - 20:00', '30k - 50k', 4.7, 740,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'FD017', 'FD017', 'Quán Bò Nướng Trái Trúc Tri Tôn', 'quán-bò-nướng-trái-trúc-tri-tôn-fd017',
    'Bò nướng Bảy Núi', 'Bò nướng Bảy Núi', '',
    '88 Đường Hùng Vương, Khóm 4, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4126, 105.0066,
    '16:00 - 22:00', '90k - 180k', 4.7, 810,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF001', 'CF001', 'Ruộng Coffee & Homestay Tri Tôn', 'ruộng-coffee-&-homestay-tri-tôn-cf001',
    'Quán Cà Phê & Homestay', 'Quán Cà Phê & Homestay', '',
    'Đường vào Hồ Soài Chék, Ấp Kè Sen, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.415, 105.018,
    '06:30 - 18:30', '20k - 45k', 4.6, 860,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF002', 'CF002', 'Windy Hill Coffee & Homestay Tri Tôn', 'windy-hill-coffee-&-homestay-tri-tôn-cf002',
    'Quán Cà Phê & Homestay', 'Quán Cà Phê & Homestay', '',
    'Khu vực Hồ Soài Chék, Ấp Kè Sen, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.417, 105.0195,
    '06:00 - 20:00', '25k - 55k', 4.7, 720,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF003', 'CF003', 'CHẠM Coffee & Tea Tri Tôn', 'chạm-coffee-&-tea-tri-tôn-cf003',
    'Quán Cà Phê', 'Quán Cà Phê', '',
    '120 Đường Hùng Vương, Khóm 4, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4128, 105.0068,
    '07:00 - 22:00', '20k - 45k', 4.6, 510,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF004', 'CF004', 'Anpalm Cafe Tri Tôn', 'anpalm-cafe-tri-tôn-cf004',
    'Quán Cà Phê', 'Quán Cà Phê', '',
    '56 Đường Trần Hưng Đạo, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4125, 105.0075,
    '07:00 - 22:00', '25k - 50k', 4.5, 520,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF005', 'CF005', 'Tiệm Cà Phê Nhà Quê', 'tiệm-cà-phê-nhà-quê-cf005',
    'Quán Cà Phê', 'Quán Cà Phê', '',
    'Chân Cầu Số 10, Khóm 6, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.411, 105.005,
    '06:30 - 21:00', '15k - 35k', 4.5, 640,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF006', 'CF006', 'An Sơn Trà Quán', 'an-sơn-trà-quán-cf006',
    'Quán Cà Phê', 'Quán Cà Phê', '',
    'Đường lên Hồ Soài So, Khóm 1, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.406, 105.023,
    '07:00 - 21:00', '20k - 40k', 4.6, 410,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF007', 'CF007', 'NY Coffee & Tea Tri Tôn', 'ny-coffee-&-tea-tri-tôn-cf007',
    'Quán Cà Phê', 'Quán Cà Phê', '',
    '66 Đường Trần Phú, Khóm 2, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.414, 105.006,
    '07:00 - 21:30', '20k - 40k', 4.4, 380,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF008', 'CF008', 'Mây Coffee & Tea Hồ Soài Chék', 'mây-coffee-&-tea-hồ-soài-chék-cf008',
    'Quán Cà Phê', 'Quán Cà Phê', '',
    'Ven bờ Hồ Soài Chék, Ấp Kè Sen, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.4165, 105.0185,
    '06:30 - 18:30', '20k - 40k', 4.5, 340,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF009', 'CF009', 'Quy Coffee House Tri Tôn', 'quy-coffee-house-tri-tôn-cf009',
    'Quán Cà Phê', 'Quán Cà Phê', '',
    '34 Đường Nguyễn Trãi, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.413, 105.007,
    '06:00 - 22:00', '18k - 40k', 4.5, 490,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF010', 'CF010', 'Quán Cà Phê Mùa Gió Lên Hồ Soài So', 'quán-cà-phê-mùa-gió-lên-hồ-soài-so-cf010',
    'Quán Cà Phê', 'Quán Cà Phê', '',
    'Khu vực Hồ Soài So, Khóm 1, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4065, 105.0245,
    '07:00 - 18:00', '20k - 40k', 4.5, 310,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF011', 'CF011', 'Lang Lang Coffee & Tea', 'lang-lang-coffee-&-tea-cf011',
    'Quán Cà Phê', 'Quán Cà Phê', '',
    '78 Đường Trần Hưng Đạo, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.412, 105.008,
    '07:00 - 21:30', '20k - 38k', 4.4, 270,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF012', 'CF012', 'Tuyết Anh Homestay & Coffee', 'tuyết-anh-homestay-&-coffee-cf012',
    'Homestay', 'Homestay', '',
    '86 Đường Nguyễn Thị Minh Khai, Khóm 4, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.411, 105.0095,
    '24/7', '250k - 450k', 4.6, 390,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'CF013', 'CF013', 'Rồng Vàng Resort Tri Tôn', 'rồng-vàng-resort-tri-tôn-cf013',
    'Resort', 'Resort', '',
    '19 Đường Nguyễn Thị Minh Khai, Khóm 4, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.41, 105.01,
    '24/7', '500k - 900k', 4.5, 620,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'EV001', 'EV001', 'Lễ Hội Đua Bò Bảy Núi Tri Tôn', 'lễ-hội-đua-bò-bảy-núi-tri-tôn-ev001',
    'Lễ hội Khmer', 'Lễ hội Khmer', '',
    'Sân đua bò Tri Tôn, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.412, 105.008,
    'Lễ Sene Dolta', 'Miễn phí', 4.9, 2500,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'EV002', 'EV002', 'Nghệ Thuật Viết Kinh Lá Buông Chùa Xà Tón', 'nghệ-thuật-viết-kinh-lá-buông-chùa-xà-tón-ev002',
    'Di sản Quốc gia', 'Di sản Quốc gia', '',
    'Chùa Xà Tón, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4132, 105.0088,
    '08:00 - 17:00', 'Miễn phí', 4.8, 980,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_083', 'TT_083', 'Nhà hàng Gà Đốt Ô Thum Siêu Bó', 'nhà-hàng-gà-đốt-ô-thum-siêu-bó-tt_083',
    'food_and_restaurants', 'food_and_restaurants', 'Nhà hàng phục vụ gà đốt lá chúc nướng niêu đất truyền thống tại bờ hồ Ô Thum.',
    'Khu vực Hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.3775, 104.9921,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.6, 1420,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_084', 'TT_084', 'Nhà hàng Bò 7 Món Ba Chúc', 'nhà-hàng-bò-7-món-ba-chúc-tt_084',
    'food_and_restaurants', 'food_and_restaurants', 'Nhà hàng thịt bò Bảy Núi nướng bơ tỏi và lẩu bò trái trúc thơm lừng.',
    'Tỉnh lộ 955N, Ấp An Bình, Thị trấn Ba Chúc, Tri Tôn, An Giang', 'Thị trấn Ba Chúc', 10.496, 104.909,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.6, 670,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_085', 'TT_085', 'Quán Bún Nước Lèo Tri Tôn Chị Tư', 'quán-bún-nước-lèo-tri-tôn-chị-tư-tt_085',
    'food_and_restaurants', 'food_and_restaurants', 'Quán bún nước lèo cá lóc đồng mắm bò hóc truyền thống kèm heo quay.',
    'Đường Trần Hưng Đạo, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4128, 105.0065,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.8, 650,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_086', 'TT_086', 'Lò Đường Thốt Nốt Nguyên Chất Chau Lăng - Út Huệ', 'lò-đường-thốt-nốt-nguyên-chất-chau-lăng---út-huệ-tt_086',
    'food_and_restaurants', 'food_and_restaurants', 'Lò thắng đường thốt nốt mật ngào dẻo thủ công chính gốc.',
    'Tỉnh lộ 941, Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.435, 104.985,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.9, 340,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_087', 'TT_087', 'Tiệm Bánh Bò Thốt Nốt Nướng Chợ Tri Tôn', 'tiệm-bánh-bò-thốt-nốt-nướng-chợ-tri-tôn-tt_087',
    'food_and_restaurants', 'food_and_restaurants', 'Bánh bò thốt nốt nướng ngào nước cốt dừa dẻo thơm.',
    'Khu ẩm thực Chợ Tri Tôn, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.412, 105.006,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.8, 480,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_088', 'TT_088', 'Cà Phê Suối Tri Tôn View Núi Cô Tô', 'cà-phê-suối-tri-tôn-view-núi-cô-tô-tt_088',
    'cafes_and_homestays', 'cafes_and_homestays', 'Quán cà phê suối tự nhiên nước mát lạnh góc view chân núi Cô Tô.',
    'Suối Soài So, Chân núi Cô Tô, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Xã Cô Tô', 10.385, 105.012,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.6, 360,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_089', 'TT_089', 'Quán Cà Phê & Điểm Check-in Bờ Hồ Ô Tà Lọt', 'quán-cà-phê-&-điểm-check-in-bờ-hồ-ô-tà-lọt-tt_089',
    'cafes_and_homestays', 'cafes_and_homestays', 'Quán coffee view lòng hồ Ô Tà Lọt tĩnh lặng nép mình dưới chân dãy núi Dài.',
    'Khu vực Hồ Ô Tà Lọt, Xã An Hảo, Tri Tôn, An Giang', 'Xã An Hảo', 10.478, 104.962,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.5, 290,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_090', 'TT_090', 'Soài Chek Homestay & Coffee', 'soài-chek-homestay-&-coffee-tt_090',
    'cafes_and_homestays', 'cafes_and_homestays', 'Homestay sân vườn không gian thoáng đãng view hồ Soài Chek.',
    'Ấp Kè Sen, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.411, 105.018,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.7, 450,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_091', 'TT_091', 'Nhà Nghi & Khách Sạn Triệu Gia Tri Tôn', 'nhà-nghi-&-khách-sạn-triệu-gia-tri-tôn-tt_091',
    'cafes_and_homestays', 'cafes_and_homestays', 'Khách sạn phòng sạch sẽ tiện nghi trung tâm Thị trấn Tri Tôn.',
    'Đường Trần Hưng Đạo, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.415, 105.008,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.4, 310,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_092', 'TT_092', 'Chùa Xvayton (Chùa Cũ 500 năm)', 'chùa-xvayton-chùa-cũ-500-năm-tt_092',
    'khmer_pagodas_heritage', 'khmer_pagodas_heritage', 'Ngôi chùa Khmer cổ nhất An Giang lưu giữ nhiều bộ kinh lá buông độc đáo.',
    'Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4132, 105.0088,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.8, 1250,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_093', 'TT_093', 'Chùa Tà Pạ', 'chùa-tà-pạ-tt_093',
    'khmer_pagodas_heritage', 'khmer_pagodas_heritage', 'Ngôi chùa Khmer trên ngọn đồi Tà Pạ có kiến trúc tháp nhọn uy nghi.',
    'Đồi Tà Pạ, Ấp Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.4225, 105.0125,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.7, 980,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_094', 'TT_094', 'Khu Du Lịch Núi Cô Tô (Phụng Hoàng Sơn)', 'khu-du-lịch-núi-cô-tô-phụng-hoàng-sơn-tt_094',
    'attractions_nature', 'attractions_nature', 'Ngọn núi cao 614m danh sơn Thất Sơn Bảy Núi có Hồ Soài So và suối Ô Tà Sóc.',
    'Dãy núi Cô Tô, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Xã Cô Tô', 10.384, 105.008,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.7, 2100,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_095', 'TT_095', 'Hồ Tà Pạ', 'hồ-tà-pạ-tt_095',
    'attractions_nature', 'attractions_nature', 'Hồ nước xanh trong ngọc tuyệt đẹp được mệnh danh là Tuyệt Tình Cốc Bảy Núi.',
    'Núi Tà Pạ, Ấp Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang', 'Xã Núi Tô', 10.4216, 105.0118,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.7, 2850,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_096', 'TT_096', 'Hồ Soài So', 'hồ-soài-so-tt_096',
    'attractions_nature', 'attractions_nature', 'Hồ thủy lợi thơ mộng soi bóng dãy núi Phụng Hoàng Sơn.',
    'Chân núi Cô Tô, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Xã Cô Tô', 10.386, 105.011,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.6, 1340,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_097', 'TT_097', 'Khu Di Tích Lịch Sử Đồi Tức Dụp', 'khu-di-tích-lịch-sử-đồi-tức-dụp-tt_097',
    'attractions_nature', 'attractions_nature', 'Ngọn đồi 2 triệu đô căn cứ kháng chiến kiên cường với hệ thống hang đá huyền bí.',
    'Ấp Ninh Hòa, Xã An Tức, Tri Tôn, An Giang', 'Xã An Tức', 10.3702, 104.9667,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.6, 3100,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_098', 'TT_098', 'Cánh Đồng Thốt Nốt Trái Tim An Tức', 'cánh-đồng-thốt-nốt-trái-tim-an-tức-tt_098',
    'checkin_spots', 'checkin_spots', 'Hàng cây thốt nốt tự nhiên tạo thành hình trái tim độc đáo giữa cánh đồng.',
    'Ấp Ninh Hòa, Xã An Tức, Tri Tôn, An Giang', 'Xã An Tức', 10.371, 104.975,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.7, 1890,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_099', 'TT_099', 'Cổng Trời Tri Tôn (Cổng Chùa Koh Kas)', 'cổng-trời-tri-tôn-cổng-chùa-koh-kas-tt_099',
    'checkin_spots', 'checkin_spots', 'Cổng chùa Khmer cổ hoa văn tinh xảo đứng trần giữa đồng lúa.',
    'Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.438, 104.981,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.8, 2450,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_100', 'TT_100', 'Chợ Trung Tâm Tri Tôn', 'chợ-trung-tâm-tri-tôn-tt_100',
    'food_and_restaurants', 'food_and_restaurants', 'Chợ trung tâm sầm uất ngập tràn ẩm thực bánh bò thốt nốt, bún nước lèo.',
    'Đường Tran Hung Dao, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4125, 105.0068,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.5, 1120,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_101', 'TT_101', 'Khu Ẩm Thực Chợ Đêm Tri Tôn', 'khu-ẩm-thực-chợ-đêm-tri-tôn-tt_101',
    'food_and_restaurants', 'food_and_restaurants', 'Khu phố chợ đêm sầm uất bán đồ ăn vặt thốt nốt, xiên nướng, cháo bò.',
    'Quảng trường Quảng Tế, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.4138, 105.0075,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.6, 780,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_102', 'TT_102', 'Gà Đốt Ô Thum Siêu Bó', 'gà-đốt-ô-thum-siêu-bó-tt_102',
    'food_and_restaurants', 'food_and_restaurants', 'Gà đốt lá chúc giòn da thơm cay bản địa tại bờ hồ Ô Thum.',
    'Bờ hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang', 'Xã Ô Lâm', 10.3775, 104.9921,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.6, 1420,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_103', 'TT_103', 'Quán Đu Đủ Đâm & Cánh Gà Nướng Rô', 'quán-đu-đủ-đâm-&-cánh-gà-nướng-rô-tt_103',
    'food_and_restaurants', 'food_and_restaurants', 'Món đu đủ đâm Khmer giòn sần sật cay chua cay ăn kèm cánh gà nướng.',
    'Tỉnh lộ 941, Ấp An Hòa, Xã Chau Lăng, Tri Tôn, An Giang', 'Xã Chau Lăng', 10.436, 104.984,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.7, 590,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_104', 'TT_104', 'Quán Bò Nướng Bánh Tráng Tư Liêm', 'quán-bò-nướng-bánh-tráng-tư-liêm-tt_104',
    'food_and_restaurants', 'food_and_restaurants', 'Bò Bảy Núi nướng vỉ thơm lừng cuốn bánh tráng chấm mắm bò hóc.',
    'Đường Nam Kỳ Khởi Nghĩa, Khóm 2, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.414, 105.0095,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.6, 520,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_105', 'TT_105', 'Tiệm Bánh Kẹp Thốt Nốt & Bánh Cốt Dừa Chùa Cũ', 'tiệm-bánh-kẹp-thốt-nốt-&-bánh-cốt-dừa-chùa-cũ-tt_105',
    'food_and_restaurants', 'food_and_restaurants', 'Các món bánh dân gian Khmer đượm vị thốt nốt dừa tươi nướng giòn.',
    'Trước cổng Chùa Xvayton, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang', 'Thị trấn Tri Tôn', 10.413, 105.0085,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.8, 410,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO public.places (
    id, place_id, name, slug, category, tourism_category, description,
    address, commune, latitude, longitude, opening_hours, price_level,
    rating, review_count, confidence_score, is_active
) VALUES (
    'TT_106', 'TT_106', 'Lò Đường Thốt Nốt Nguyên Chất Châu Lăng - Út Huệ', 'lò-đường-thốt-nốt-nguyên-chất-châu-lăng---út-huệ-tt_106',
    'food_and_restaurants', 'food_and_restaurants', 'Lò thắng đường thốt nốt mật ngào dẻo thủ công chính gốc.',
    'Tỉnh lộ 948, Xã Châu Lăng, An Giang', 'Xã Châu Lăng', 10.435, 104.985,
    '08:00 - 20:00', 'Tùy món / Dịch vụ', 4.9, 340,
    95.0, TRUE
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    address = EXCLUDED.address,
    commune = EXCLUDED.commune,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    opening_hours = EXCLUDED.opening_hours,
    price_level = EXCLUDED.price_level,
    updated_at = CURRENT_TIMESTAMP;

-- SEED VIDEOS
INSERT INTO public.videos (
    place_id, title, platform, video_url, embed_url, author_name, is_verified
) VALUES (
    'PL001', 'Trải nghiệm Hồ Tà Pạ mùa nước xanh trong ngọc - Tri Tôn An Giang', 'tiktok', 'https://www.tiktok.com/@phuot_miennui/video/7234567890123456789', 'https://www.tiktok.com/embed/v2/7234567890123456789', '@phuot_miennui', TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO public.videos (
    place_id, title, platform, video_url, embed_url, author_name, is_verified
) VALUES (
    'PL001', 'Bí kíp thưởng thức Gà Đốt lá chúc Ô Thum giòn ngon chuẩn vị bản địa', 'tiktok', 'https://www.tiktok.com/@amthuc_baynui/video/7234567890999999999', 'https://www.tiktok.com/embed/v2/7234567890999999999', '@amthuc_baynui', TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO public.videos (
    place_id, title, platform, video_url, embed_url, author_name, is_verified
) VALUES (
    'PL001', 'Khám phá ngôi Chùa Khmer cổ nhất An Giang 500 năm tuổi tại Tri Tôn', 'youtube_shorts', 'https://www.youtube.com/shorts/dQw4w9WgXcQ', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Văn Hóa Bảy Núi', TRUE
) ON CONFLICT DO NOTHING;

COMMIT;