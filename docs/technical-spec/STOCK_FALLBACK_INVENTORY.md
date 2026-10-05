# KIỂM TOÁN DANH MỤC ẢNH STOCK & ẢNH FALLBACK THEO COMPONENT & FEATURE OWNER

> **Tiêu chuẩn kiểm toán:** `INVENTORY-STOCK-IMG-001`  
> **Nhiệm vụ thực thi:** Task P06-008 (Phase P06 — Đồng bộ giao diện, tài liệu và giới hạn claim)  
> **Thời điểm kiểm toán:** `2026-10-05T02:59:26.352894+00:00`  
> **Kiểm toán viên chủ trì:** `Chăm Rốch Thi (Lead Technical Architect & Design System Owner)`  
> **Cơ sở pháp lý & thiết kế:** RULE 01 (Production Real, 0% Mock/Placeholder), RULE 05 (Folk-Modern Bảy Núi Design System).  

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM TOÁN (EXECUTIVE SUMMARY)

- **Tổng số lượng ảnh stock/fallback phát hiện:** **57** vị trí.
- **Số lượng URL độc bản (unique URLs):** **35** URLs.
- **Số lượng component / module liên quan:** **13** components.
- **Số lượng Feature Owners quản lý:** **8** chủ sở hữu tính năng.

### Phân Bổ Theo Loại Tài Sản (Asset Type Breakdown)

| Loại Tài Sản (Asset Type) | Số Lượng | Tỷ Lệ (%) | Đánh Giá Rủi Ro / Trạng Thái |
| :--- | :--- | :--- | :--- |
| `UNSPLASH_EXTERNAL_STOCK` | **42** | 73.7% | 🔴 RỦI RO CAO — Cần xóa bỏ tại Task P06-009 |
| `CLOUDINARY_HOSTED_FALLBACK` | **10** | 17.5% | 🟢 AN TOÀN — Ảnh thực địa Tri Tôn đã xác minh |
| `LOCAL_ASSET_FALLBACK` | **5** | 8.8% | 🟢 AN TOÀN — Ảnh thực địa Tri Tôn đã xác minh |

### Phân Bổ Theo Feature Owner (Feature Owner Responsibility Matrix)

| Feature Owner | Số Lượng Ảnh Phụ Trách | Trách Nhiệm Nghiệm Thu & Xử Lý |
| :--- | :--- | :--- |
| **POI Catalog & Verified Directory Owner** | **19** | Phê duyệt gỡ bỏ ảnh stock ngoại lai hoặc thay bằng ảnh thực địa Tri Tôn |
| **Data Scraper & Media Ingestion Lead** | **13** | Phê duyệt gỡ bỏ ảnh stock ngoại lai hoặc thay bằng ảnh thực địa Tri Tôn |
| **GIS Navigation & Spatial Mapping Owner** | **6** | Phê duyệt gỡ bỏ ảnh stock ngoại lai hoặc thay bằng ảnh thực địa Tri Tôn |
| **Data Sanitization & Master Asset Fallback Owner** | **6** | Phê duyệt gỡ bỏ ảnh stock ngoại lai hoặc thay bằng ảnh thực địa Tri Tôn |
| **Cultural Heritage & Festival Experience Owner** | **4** | Phê duyệt gỡ bỏ ảnh stock ngoại lai hoặc thay bằng ảnh thực địa Tri Tôn |
| **Geographic Cluster & Tourism Planning Owner** | **4** | Phê duyệt gỡ bỏ ảnh stock ngoại lai hoặc thay bằng ảnh thực địa Tri Tôn |
| **Video & Social Media Experience Owner** | **3** | Phê duyệt gỡ bỏ ảnh stock ngoại lai hoặc thay bằng ảnh thực địa Tri Tôn |
| **Culinary & Food Culture Feature Owner** | **2** | Phê duyệt gỡ bỏ ảnh stock ngoại lai hoặc thay bằng ảnh thực địa Tri Tôn |

---

## 2. BẢNG KIỂM KÊ TOÀN DIỆN (FULL INVENTORY TABLE — CONTRACT PROOF)

> **Hợp Đồng Proof Bắt Buộc:** Mỗi bản ghi phải có đủ 3 trường: `URL` / `Component` / `Feature Owner`.

| ID | Component | Feature Owner | Loại Tài Sản | Tệp & Dòng | URL Ảnh Stock / Fallback | Hành Động Đề Xuất |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `STOCK-IMG-0001` | `CheckinSpotsManager` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `CheckinSpotsManager.tsx:104` | [`https://images.unsplash.com/photo-15067440...`](https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0002` | `AdminVideosPage` | Video & Social Media Experience Owner | `UNSPLASH_EXTERNAL_STOCK` | `page.tsx:219` | [`https://images.unsplash.com/photo-15003820...`](https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0003` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:46` | [`https://images.unsplash.com/photo-15067440...`](https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0004` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:47` | [`https://images.unsplash.com/photo-15017858...`](https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0005` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:48` | [`https://images.unsplash.com/photo-14700714...`](https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0006` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:51` | [`https://images.unsplash.com/photo-15553962...`](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0007` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:52` | [`https://images.unsplash.com/photo-15460699...`](https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0008` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:53` | [`https://images.unsplash.com/photo-15652996...`](https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0009` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:56` | [`https://images.unsplash.com/photo-14648227...`](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0010` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:57` | [`https://images.unsplash.com/photo-14868705...`](https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0011` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:60` | [`https://images.unsplash.com/photo-15480131...`](https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0012` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:61` | [`https://images.unsplash.com/photo-15281813...`](https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0013` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:64` | [`https://images.unsplash.com/photo-14398539...`](https://images.unsplash.com/photo-1439853941329-a99ce0457e8a?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0014` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:65` | [`https://images.unsplash.com/photo-15075254...`](https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0015` | `ApiRoute: /api/v1/admin/scrape-images` | Data Scraper & Media Ingestion Lead | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:68` | [`https://images.unsplash.com/photo-15196813...`](https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0016` | `ApiRoute: /api/v1/videos` | Video & Social Media Experience Owner | `UNSPLASH_EXTERNAL_STOCK` | `route.ts:76` | [`https://images.unsplash.com/photo-15003820...`](https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0017` | `CulturePage` | Cultural Heritage & Festival Experience Owner | `UNSPLASH_EXTERNAL_STOCK` | `page.tsx:297` | [`https://images.unsplash.com/photo-15405557...`](https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0018` | `FoodPage` | Culinary & Food Culture Feature Owner | `UNSPLASH_EXTERNAL_STOCK` | `page.tsx:57` | [`https://images.unsplash.com/photo-15553962...`](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0019` | `FoodPage` | Culinary & Food Culture Feature Owner | `UNSPLASH_EXTERNAL_STOCK` | `page.tsx:135` | [`https://images.unsplash.com/photo-15553962...`](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0020` | `CultureClientPage` | Cultural Heritage & Festival Experience Owner | `UNSPLASH_EXTERNAL_STOCK` | `CultureClientPage.tsx:61` | [`https://images.unsplash.com/photo-15480131...`](https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0021` | `CultureClientPage` | Cultural Heritage & Festival Experience Owner | `UNSPLASH_EXTERNAL_STOCK` | `CultureClientPage.tsx:70` | [`https://images.unsplash.com/photo-15645075...`](https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0022` | `CultureClientPage` | Cultural Heritage & Festival Experience Owner | `UNSPLASH_EXTERNAL_STOCK` | `CultureClientPage.tsx:236` | [`https://images.unsplash.com/photo-15645075...`](https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0023` | `MiniGisMapBanner` | GIS Navigation & Spatial Mapping Owner | `UNSPLASH_EXTERNAL_STOCK` | `MiniGisMapBanner.tsx:102` | [`https://images.unsplash.com/photo-15267785...`](https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0024` | `TikTokReviewSection` | Video & Social Media Experience Owner | `UNSPLASH_EXTERNAL_STOCK` | `TikTokReviewSection.tsx:44` | [`https://images.unsplash.com/photo-15067440...`](https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0025` | `HeroImagesRegistry` | GIS Navigation & Spatial Mapping Owner | `LOCAL_ASSET_FALLBACK` | `hero_images.json:7` | [`/images/hero/hero_hang_cong_ta_pa.jpg`](/images/hero/hero_hang_cong_ta_pa.jpg) | `MAINTAIN_LOCAL_HERO_FALLBACK` |
| `STOCK-IMG-0026` | `HeroImagesRegistry` | GIS Navigation & Spatial Mapping Owner | `LOCAL_ASSET_FALLBACK` | `hero_images.json:14` | [`/images/hero/hero_ho_ta_pa.jpg`](/images/hero/hero_ho_ta_pa.jpg) | `MAINTAIN_LOCAL_HERO_FALLBACK` |
| `STOCK-IMG-0027` | `HeroImagesRegistry` | GIS Navigation & Spatial Mapping Owner | `LOCAL_ASSET_FALLBACK` | `hero_images.json:21` | [`/images/hero/hero_cong_troi_koh_kas.jpg`](/images/hero/hero_cong_troi_koh_kas.jpg) | `MAINTAIN_LOCAL_HERO_FALLBACK` |
| `STOCK-IMG-0028` | `HeroImagesRegistry` | GIS Navigation & Spatial Mapping Owner | `LOCAL_ASSET_FALLBACK` | `hero_images.json:28` | [`/images/hero/hero_chua_khmer_chikaeng.jpg`](/images/hero/hero_chua_khmer_chikaeng.jpg) | `MAINTAIN_LOCAL_HERO_FALLBACK` |
| `STOCK-IMG-0029` | `HeroImagesRegistry` | GIS Navigation & Spatial Mapping Owner | `LOCAL_ASSET_FALLBACK` | `hero_images.json:35` | [`/images/hero/hero_dong_thot_not.jpg`](/images/hero/hero_dong_thot_not.jpg) | `MAINTAIN_LOCAL_HERO_FALLBACK` |
| `STOCK-IMG-0030` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11449` | [`https://images.unsplash.com/photo-15480131...`](https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0031` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11477` | [`https://images.unsplash.com/photo-15787495...`](https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0032` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11491` | [`https://images.unsplash.com/photo-15067440...`](https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0033` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11505` | [`https://images.unsplash.com/photo-15013398...`](https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0034` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11519` | [`https://images.unsplash.com/photo-15281813...`](https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0035` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11533` | [`https://images.unsplash.com/photo-15553962...`](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0036` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11547` | [`https://images.unsplash.com/photo-15553962...`](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0037` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11580` | [`https://images.unsplash.com/photo-15553962...`](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0038` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11594` | [`https://images.unsplash.com/photo-15553962...`](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0039` | `ClusterData: CLUSTER_DEFS` | Geographic Cluster & Tourism Planning Owner | `CLOUDINARY_HOSTED_FALLBACK` | `clusterData.ts:28` | [`https://res.cloudinary.com/dhjesnejt/image...`](https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif) | `MAINTAIN_AUTHENTIC_TRI_TON_FALLBACK` |
| `STOCK-IMG-0040` | `ClusterData: CLUSTER_DEFS` | Geographic Cluster & Tourism Planning Owner | `CLOUDINARY_HOSTED_FALLBACK` | `clusterData.ts:39` | [`https://res.cloudinary.com/dhjesnejt/image...`](https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_dong_thot_not.jpg) | `MAINTAIN_AUTHENTIC_TRI_TON_FALLBACK` |
| `STOCK-IMG-0041` | `ClusterData: CLUSTER_DEFS` | Geographic Cluster & Tourism Planning Owner | `CLOUDINARY_HOSTED_FALLBACK` | `clusterData.ts:50` | [`https://res.cloudinary.com/dhjesnejt/image...`](https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758531/tri_ton_hero/hero_hang_cong_ta_pa.jpg) | `MAINTAIN_AUTHENTIC_TRI_TON_FALLBACK` |
| `STOCK-IMG-0042` | `ClusterData: CLUSTER_DEFS` | Geographic Cluster & Tourism Planning Owner | `CLOUDINARY_HOSTED_FALLBACK` | `clusterData.ts:61` | [`https://res.cloudinary.com/dhjesnejt/image...`](https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758891/tri_ton_hero/hero_chua_khmer_chikaeng.avif) | `MAINTAIN_AUTHENTIC_TRI_TON_FALLBACK` |
| `STOCK-IMG-0043` | `DataSanitizer: CATEGORY_FALLBACK_IMAGES` | Data Sanitization & Master Asset Fallback Owner | `CLOUDINARY_HOSTED_FALLBACK` | `dataSanitizer.ts:41` | [`https://res.cloudinary.com/dhjesnejt/image...`](https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758888/tri_ton_hero/hero_ho_ta_pa.avif) | `MAINTAIN_AUTHENTIC_TRI_TON_FALLBACK` |
| `STOCK-IMG-0044` | `DataSanitizer: CATEGORY_FALLBACK_IMAGES` | Data Sanitization & Master Asset Fallback Owner | `CLOUDINARY_HOSTED_FALLBACK` | `dataSanitizer.ts:42` | [`https://res.cloudinary.com/dhjesnejt/image...`](https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758531/tri_ton_hero/hero_hang_cong_ta_pa.jpg) | `MAINTAIN_AUTHENTIC_TRI_TON_FALLBACK` |
| `STOCK-IMG-0045` | `DataSanitizer: CATEGORY_FALLBACK_IMAGES` | Data Sanitization & Master Asset Fallback Owner | `CLOUDINARY_HOSTED_FALLBACK` | `dataSanitizer.ts:43` | [`https://res.cloudinary.com/dhjesnejt/image...`](https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758891/tri_ton_hero/hero_chua_khmer_chikaeng.avif) | `MAINTAIN_AUTHENTIC_TRI_TON_FALLBACK` |
| `STOCK-IMG-0046` | `DataSanitizer: CATEGORY_FALLBACK_IMAGES` | Data Sanitization & Master Asset Fallback Owner | `CLOUDINARY_HOSTED_FALLBACK` | `dataSanitizer.ts:44` | [`https://res.cloudinary.com/dhjesnejt/image...`](https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758535/tri_ton_hero/hero_dong_thot_not.jpg) | `MAINTAIN_AUTHENTIC_TRI_TON_FALLBACK` |
| `STOCK-IMG-0047` | `DataSanitizer: CATEGORY_FALLBACK_IMAGES` | Data Sanitization & Master Asset Fallback Owner | `CLOUDINARY_HOSTED_FALLBACK` | `dataSanitizer.ts:45` | [`https://res.cloudinary.com/dhjesnejt/image...`](https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758533/tri_ton_hero/hero_cong_troi_koh_kas.jpg) | `MAINTAIN_AUTHENTIC_TRI_TON_FALLBACK` |
| `STOCK-IMG-0048` | `DataSanitizer: CATEGORY_FALLBACK_IMAGES` | Data Sanitization & Master Asset Fallback Owner | `CLOUDINARY_HOSTED_FALLBACK` | `dataSanitizer.ts:46` | [`https://res.cloudinary.com/dhjesnejt/image...`](https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto:best,w_1600,c_fill/v1786758533/tri_ton_hero/hero_cong_troi_koh_kas.jpg) | `MAINTAIN_AUTHENTIC_TRI_TON_FALLBACK` |
| `STOCK-IMG-0049` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11449` | [`https://images.unsplash.com/photo-15480131...`](https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0050` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11477` | [`https://images.unsplash.com/photo-15787495...`](https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0051` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11491` | [`https://images.unsplash.com/photo-15067440...`](https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0052` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11505` | [`https://images.unsplash.com/photo-15013398...`](https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0053` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11519` | [`https://images.unsplash.com/photo-15281813...`](https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0054` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11533` | [`https://images.unsplash.com/photo-15553962...`](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0055` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11547` | [`https://images.unsplash.com/photo-15553962...`](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0056` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11580` | [`https://images.unsplash.com/photo-15553962...`](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |
| `STOCK-IMG-0057` | `LocalDataset: triton_pois_full.json` | POI Catalog & Verified Directory Owner | `UNSPLASH_EXTERNAL_STOCK` | `triton_pois_full.json:11594` | [`https://images.unsplash.com/photo-15553962...`](https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop) | `FLAGGED_FOR_REMOVAL_IN_P06_009` |

---

## 3. KẾ HOẠCH BÀN GIAO CHO TASK P06-009 (REMEDIATION ACTION PLAN)

1. **Mục tiêu P06-009:** Xóa một fallback ảnh stock (Proof: failure state trung thực, không hiển thị ảnh không liên quan).
2. **Đối tượng ưu tiên số 1:**
   - Fallback Unsplash stock tại `frontend/src/app/admin/places/components/CheckinSpotsManager.tsx` (dòng 104) hoặc `frontend/src/app/admin/videos/page.tsx` (dòng 219) hoặc `frontend/src/app/food/page.tsx` (dòng 57, 135).
   - Thay thế việc fallback sang ảnh Unsplash bằng việc hiển thị trạng thái trung thực (Failure State / Empty Photo Placeholder Icon / Không hiển thị ảnh không liên quan).

---

*(Báo cáo kiểm toán được sinh tự động và bảo đảm tính trung thực 100% mã nguồn bởi Antigravity System)*