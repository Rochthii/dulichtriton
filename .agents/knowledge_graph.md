# KNOWLEDGE GRAPH — Tri Tôn Tourism AI

## Entity Types

### E1: PLACE
Properties: id, name, english_name, category, subcategory, lat, lng, commune, address, tags[]
Relations: IS_IN(commune), BELONGS_TO(category_group), NEAR(place, distance_km), FEATURED_IN(video)

### E2: COMMUNE
Properties: name_vn, name_type (Xã/Thị trấn), lat_center, lng_center
Relations: PART_OF(district), CONTAINS(place)

### E3: CATEGORY_GROUP
Properties: id, name_vn, name_en, icon, color
Members: 6 groups — see Master Dataset section

### E4: FOOD
Properties: name, type, origin (Khmer/Kinh/fusion), ingredients[], price_range
Relations: AVAILABLE_AT(place), SPECIALTY_OF(commune)

### E5: FESTIVAL
Properties: name, type, month, duration, location, traditions[]
Relations: HELD_AT(place), OBSERVED_BY(ethnic_group)

### E6: MEDIA
Properties: platform (tiktok/youtube/facebook), url, title, views, place_name_mentioned[]
Relations: FEATURES(place), CREATED_BY(creator)

### E7: ROUTE
Properties: name, type (scenic/bypass/hiking), length_km, difficulty, start_point, end_point
Relations: PASSES_THROUGH(place), CONNECTS(commune, commune)

---

## Key Relationships (Triple Format)

```
(Hồ Thủy Liêm) --IS_IN--> (Xã Núi Tô)
(Xã Núi Tô) --CONTAINS--> [Hồ Thủy Liêm, Núi Tô peak, Chùa Núi Tô]
(Hồ Thủy Liêm) --BELONGS_TO--> (attractions_nature)
(Hồ Thủy Liêm) --NEAR--> (Núi Tô, 2.3km)
(Hồ Thủy Liêm) --BEST_SEASON--> (Nov-Apr)

(Đồi Tức Dụp) --IS_IN--> (Xã An Tức)
(Đồi Tức Dụp) --HISTORICAL_EVENT--> (Vietnam War resistance base)
(Đồi Tức Dụp) --ACTIVITY--> [hiking, photography, history tour]

(Ba Chúc Memorial) --IS_IN--> (Thị trấn Ba Chúc)
(Ba Chúc Memorial) --TYPE--> (khmer_pagodas_heritage)
(Ba Chúc Memorial) --NEAR--> (Chùa Phi Lai, 0.5km)

(Con đường tơ lụa) --TYPE--> (ROUTE/checkin_spots)
(Con đường tơ lụa) --PASSES_THROUGH--> [Thị trấn Tri Tôn, Xã Lê Trì, Xã Châu Lăng]
(Con đường tơ lụa) --BEST_FOR--> [photography, cycling, motorbike ride]

(Tuyến tránh Tri Tôn) --TYPE--> (ROUTE/new_bypass)
(Tuyến tránh Tri Tôn) --STATUS--> (newly_opened_2024)
(Tuyến tránh Tri Tôn) --CONNECTS--> (QL91, Thị trấn Tri Tôn)

(Thốt nốt) --IS_A--> (FOOD/local_specialty)
(Thốt nốt) --AVAILABLE_AT--> [Chợ Tri Tôn, roadside stalls]
(Thốt nốt) --ORIGIN--> (Khmer)
(Thốt nốt) --USED_IN--> [ice cream, bánh bò, nước uống]

(Lễ hội Đôl Ta) --IS_A--> (FESTIVAL/Khmer)
(Lễ hội Đôl Ta) --MONTH--> (September)
(Lễ hội Đôl Ta) --HELD_AT--> [Chùa Khmer throughout district]
(Lễ hội Đôl Ta) --OBSERVED_BY--> (Khmer community)
```

---

## Semantic Clusters (for Vector DB)

### Cluster A: Nature & Adventure
Keywords: núi, hồ, rừng, trekking, cắm trại, bình minh, hoàng hôn, leo núi
Nodes: Hồ Thủy Liêm, Núi Tô, Núi Cô Tô, Đồng Cỏ Năn, Hồ Soài So

### Cluster B: Cultural Heritage
Keywords: chùa Khmer, di tích, lịch sử, tín ngưỡng, nghệ thuật, phù điêu
Nodes: Chùa Xvayton, Ba Chúc Memorial, Chùa Phi Lai, Chùa Tà Miệt, Đồi Tức Dụp

### Cluster C: Food & Gastronomy  
Keywords: ăn, quán, đặc sản, ngon, ẩm thực, thốt nốt, mắm, bánh
Nodes: all food_and_restaurants + cafes_and_homestays records

### Cluster D: Photo & Social Media
Keywords: check-in, chụp ảnh, sống ảo, đẹp, tiktok, instagram, video, vlog
Nodes: all checkin_spots + scenic routes + cafes

### Cluster E: Scenic Roads
Keywords: đường, lái xe, chạy xe, phượt, tuyến, con đường, cung đường
Nodes: Con đường tơ lụa, Tuyến tránh Tri Tôn, QL91, đường lên núi
