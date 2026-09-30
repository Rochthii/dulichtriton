# SỔ QUẢN LÝ XUNG ĐỘT DỮ LIỆU POI — DATA CONFLICT REVIEW QUEUE (P03-003 -> P03-006)

> **Mã quy chuẩn:** `DATA-CONFLICT-QUEUE-001`  
> **Tổng số Ticket xung đột:** `102` tickets độc lập (`3` RESOLVED / `99` OPEN)  
> **Ngày cập nhật:** `2026-09-28` · **Trạng thái:** `ACTIVE_REVIEW_QUEUE (Incremental Resolution)`  
> **Nguyên tắc:** Mỗi xung đột có một ticket riêng (Atomic Ticket); không đóng bulk ticket; mọi quyết định đều có nguồn minh chứng.

## 1. Phân Loại Danh Mục Xung Đột

| Loại xung đột | Số lượng ticket | Tỷ lệ | Định hướng xử lý đề xuất |
|---|---|---|---|
| `UUID_PREFIX_STANDARDIZATION` | **73** | 71.6% | Chuẩn hóa ID chứa prefix UUID (8 ký tự) sang slug tiếng Việt không dấu sạch. |
| `UNSYNCED_MASTER_DATA` | **23** | 22.5% | Thẩm định thực địa xem POI có thực sự tồn tại ở Tri Tôn để nạp vào Master CSV hoặc loại bỏ. |
| `PILOT_ALIAS_MAPPING` | **6** | 5.9% | Ánh xạ file cào pilot vào slug canonical chính thức để kế thừa toàn bộ ảnh và multimedia. |
| **TỔNG CỘNG** | **102** | **100%** | `3` đã giải quyết, `99` đang chờ duyệt. |

## 2. Bảng Theo Dõi Chi Tiết Toàn Bộ Tickets (Review Queue Table)

| Ticket ID | Tên địa điểm | Xã / Thị trấn | ID hiện tại | Slug đề xuất / Đã duyệt | Loại xung đột | Hành động đề xuất | Trạng thái |
|---|---|---|---|---|---|---|---|
| **`CRQ-001`** | Chùa Xà Tón (Wat Xvayton) | Thị trấn Tri Tôn | `0c1d5e83-chùa-xà-tón-(wat-xva` | **`chua-xa-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_AND_MERGE` | **`RESOLVED`** ✅ |
| **`CRQ-002`** | Quán Siêu Gà Đốt Ô Thum (Chau Siêu) | Xã Ô Lâm | `118f63fc-quán-siêu-gà-đốt-ô-t` | **`quan-sieu-ga-dot-o-thum-chau-sieu`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-003`** | Nhà hàng Gà Đốt Ô Thum Siêu Bó | Xã Ô Lâm | `1370b402-nhà-hàng-gà-đốt-ô-th` | **`nha-hang-ga-dot-o-thum-sieu-bo`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-004`** | Quán Đu Đủ Đâm RiNa Khmer | Xã Châu Lăng | `159c4012-quán-đu-đủ-đâm-rina-` | **`quan-du-du-dam-rina-khmer`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-005`** | Căn Nhà Gỗ Vintage Nhà Quê | Thị trấn Tri Tôn | `1c3216be-căn-nhà-gỗ-vintage-n` | **`can-nha-go-vintage-nha-que`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-006`** | Gà Đốt Vương Ngọc Ô Thum | Xã Ô Lâm | `24a1fc67-gà-đốt-vương-ngọc-ô-` | **`ga-dot-vuong-ngoc-o-thum`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-007`** | Khu Di Tích Căn Cứ Ô Tà Sóc | Xã Lương Phi | `28310684-khu-di-tích-căn-cứ-ô` | **`khu-di-tich-can-cu-o-ta-soc`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-008`** | Con Đường Thốt Nốt Ô Lâm - Cô Tô | Xã Cô Tô | `2ac3fb9a-con-đường-thốt-nốt-ô` | **`con-duong-thot-not-o-lam-co-to`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-009`** | Quán Bún Cá Củ Ngải Khmer (Num Banh Chok) — Cô Tuôk & Dì Pâu | Thị trấn Tri Tôn | `2f0b8880-quán-bún-nước-lèo-tr` | **`quan-bun-ca-cu-ngai-khmer-num-banh-chok-co-tuok-di-pau`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-010`** | Vườn Mãng Cầu Ta Núi Tô | Xã Núi Tô | `30ac578e-vườn-mãng-cầu-núi-tô` | **`vuon-mang-cau-ta-nui-to`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-011`** | Lò Bánh Bò Thốt Nốt Nướng Út Cột | Thị trấn Tri Tôn | `30e73939-lò-bánh-bò-thốt-nốt-` | **`lo-banh-bo-thot-not-nuong-ut-cot`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-012`** | Con Đường Vòm Còng Châu Lăng | Xã Châu Lăng | `3383c54e-con-đường-vòm-còng-c` | **`con-duong-vom-cong-chau-lang`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-013`** | Rừng Tầm Vông Ô Tà Sóc | Xã Lương Phi | `39c60a82-rừng-tầm-vông-ô-tà-s` | **`rung-tam-vong-o-ta-soc`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-014`** | Đá Vồ Hội Mẹ Cô Tô | Xã Cô Tô | `3adb5c32-đá-vồ-hội-mẹ-cô-tô` | **`da-vo-hoi-me-co-to`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-015`** | Tiệm Bánh Kẹp Thốt Nốt & Bánh Cốt Dừa Chùa Cũ | Thị trấn Tri Tôn | `3c55a285-tiệm-bánh-kẹp-thốt-n` | **`tiem-banh-kep-thot-not-banh-cot-dua-chua-cu`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-016`** | Tiệm Bánh Bò Thốt Nốt Nướng Chợ Tri Tôn | Thị trấn Tri Tôn | `3dadd505-tiệm-bánh-bò-thốt-nố` | **`tiem-banh-bo-thot-not-nuong-cho-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-017`** | Quán Cà Phê & Điểm Check-in Bờ Hồ Ô Tà Lọt | Thị trấn Tri Tôn | `3ef4f129-quán-cà-phê-&-điểm-c` | **`quan-ca-phe-diem-check-in-bo-ho-o-ta-lot`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-018`** | Quán Bò 7 Món Ba Chúc & Bò Nướng Trái Chúc | Thị trấn Ba Chúc | `436c0b0d-quán-bò-7-món-ba-chú` | **`quan-bo-7-mon-ba-chuc-bo-nuong-trai-chuc`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-019`** | Cung Đường Biên Giới Kênh Vĩnh Tế (Ba Chúc) | Thị trấn Ba Chúc | `4425a57d-cung-đường-biên-giới` | **`cung-duong-bien-gioi-kenh-vinh-te-ba-chuc`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-020`** | An Sơn Trà Quán | Thị trấn Tri Tôn | `442b77de-an-sơn-trà-quán` | **`an-son-tra-quan`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-021`** | Cầu Gỗ Giữa Đồng Lúa Ruộng Coffee | Thị trấn Tri Tôn | `4fc712e3-cầu-gỗ-giữa-đồng-lúa` | **`cau-go-giua-dong-lua-ruong-coffee`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-022`** | Đá Vồ Hội Đổ (Mỏm Đá Sống Ảo) | Xã Cô Tô | `5169fbf9-đá-vồ-hội-đổ-(mỏm-đá` | **`da-vo-hoi-do-mom-da-song-ao`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-023`** | Chùa Mới Ô Lâm | Xã Ô Lâm | `5c6c0c5c-chùa-mới-ô-lâm` | **`chua-moi-o-lam`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-024`** | Quán Bún Cá Củ Ngải Chị Tuôch (Che Tuôch) | Thị trấn Tri Tôn | `64fcb54d-quán-bún-cá-dook-tri` | **`quan-bun-ca-cu-ngai-chi-tuoch-che-tuoch`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-025`** | Suối Vàng Soài So | Xã Cô Tô | `6669ffb7-suối-vàng-soài-so` | **`suoi-vang-soai-so`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-026`** | Quán Đu Đủ Đâm Ly Ly | Xã Châu Lăng | `6739ba72-quán-đu-đủ-đâm-ly-ly` | **`quan-du-du-dam-ly-ly`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-027`** | Quán Bò Nướng Bánh Tráng Tư Liêm | Thị trấn Tri Tôn | `683d2086-quán-bò-nướng-bánh-t` | **`quan-bo-nuong-banh-trang-tu-liem`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-028`** | Quán Cháo Bò Tư Xuyên (58 Hùng Vương) | Thị trấn Ba Chúc | `6c77d0e8-quán-cháo-bò-trái-tr` | **`quan-chao-bo-tu-xuyen-58-hung-vuong`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-029`** | Chợ Trung Tâm Tri Tôn | Thị trấn Tri Tôn | `6fd80811-chợ-trung-tâm-tri-tô` | **`cho-trung-tam-tri-ton`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-030`** | Cầu Gỗ Mộc Mạc Hồ Ô Thum | Xã Ô Lâm | `6ffa8a7b-cầu-gỗ-mộc-mạc-hồ-ô-` | **`cau-go-moc-mac-ho-o-thum`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-031`** | Tuyết Anh Homestay & Coffee | Thị trấn Tri Tôn | `7440fc2d-tuyết-anh-homestay-&` | **`tuyet-anh-homestay-coffee`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-032`** | Vách Đá Đứng Latina | Xã An Hảo (Ranh giới giáp TX. Tịnh Biên) | `749e2a14-vách-đá-đứng-latina` | **`vach-da-dung-latina`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-033`** | RUỘNG Coffee & Tea Tri Tôn | Xã Núi Tô | `78da5b5f-ruộng-coffee-&-homes` | **`ruong-coffee-tea-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-034`** | Chùa Soài So Khmer | Thị trấn Tri Tôn | `814684e1-chùa-soài-so-khmer` | **`chua-soai-so-khmer`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-035`** | Hồ Đá Latina | Xã An Tức *(Cờ: `CROSS_BORDER_ATTRACTION`)* | `831ebb34-hồ-đá-latina` | **`ho-da-latina`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG_AND_NORMALIZE_BOUNDARY` | **`RESOLVED`** ✅ |
| **`CRQ-036`** | Nấc Thang Thiên Đường Kiều Tiên Ô Thum | Xã Cô Tô | `833d6714-nấc-thang-thiên-đườn` | **`nac-thang-thien-duong-kieu-tien-o-thum`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-037`** | Quầy Thốt Nốt Tươi Cụm Trái Tim | Thị trấn Tri Tôn | `89d12327-quầy-thốt-nốt-tươi-c` | **`quay-thot-not-tuoi-cum-trai-tim`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-038`** | Quán Bánh Xèo Tép Bông Điên Điển Cầu Số 10 | Thị trấn Tri Tôn | `8b5a9b10-quán-bánh-xèo-tép-bô` | **`quan-banh-xeo-tep-bong-dien-dien-cau-so-10`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-039`** | Quán Kiều Tiên Gà Đốt Ô Thum | Xã Ô Lâm | `8f6a436c-quán-kiều-tiên-gà-đố` | **`quan-kieu-tien-ga-dot-o-thum`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-040`** | Con Đường Tơ Lụa Tà Pạ | Xã Núi Tô | `9616e5e5-con-đường-tơ-lụa-tà-` | **`con-duong-to-lua-ta-pa`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-041`** | Quán Gà Đốt & Vườn Nho Ô Thum | Xã Ô Lâm | `9764c175-vườn-nho-nông-trại-ô` | **`quan-ga-dot-vuon-nho-o-thum`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-042`** | Con Đường Tơ Lụa Soài Chék | Thị trấn Tri Tôn | `97e67ffb-con-đường-tơ-lụa-soà` | **`con-duong-to-lua-soai-chek`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-043`** | Biển Hiệu Ở Đây Không Có Gì Ngoài Ký Ức | Thị trấn Tri Tôn | `9eaf1e8f-biển-hiệu-ở-đây-khôn` | **`bien-hieu-o-day-khong-co-gi-ngoai-ky-uc`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-044`** | Anpalm Cafe Tri Tôn (Thốt Nốt Tri Tôn) | Thị trấn Tri Tôn | `9fd79384-anpalm-cafe-tri-tôn` | **`anpalm-cafe-tri-ton-thot-not-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-045`** | Quán Đu Đủ Đâm Ty Tri Tôn | Xã Châu Lăng | `a6ed9173-quán-đu-đủ-đâm-ty-tr` | **`quan-du-du-dam-ty-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-046`** | Cây Thốt Nốt Cô Độc Châu Lăng | Xã Châu Lăng | `a810d441-cây-thốt-nốt-cô-độc-` | **`cay-thot-not-co-doc-chau-lang`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-047`** | Cánh Đồng Lúa Ba Chúc | Thị trấn Ba Chúc | `a8b28369-cánh-đồng-lúa-ba-chú` | **`canh-dong-lua-ba-chuc`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-048`** | Soài Chek Homestay & Coffee | Xã Núi Tô | `ac550583-soài-chek-homestay-&` | **`soai-chek-homestay-coffee`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-049`** | Khu Ẩm Thực Chợ Đêm Tri Tôn | Thị trấn Tri Tôn | `b1d52ac4-khu-ẩm-thực-chợ-đêm-` | **`khu-am-thuc-cho-dem-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-050`** | Chùa Phi Lai Ba Chúc | Thị trấn Ba Chúc | `b49161b0-chùa-phi-lai-ba-chúc` | **`chua-phi-lai-ba-chuc`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-051`** | Hồ Ô Tà Lọt | Thị trấn Tri Tôn | `b4e743c8-hồ-ô-tà-lọt` | **`ho-o-ta-lot`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-052`** | Mây Coffee & Tea Hồ Soài Chék (Mây Sơn Garden) | Xã Núi Tô | `b56c95ef-mây-coffee-&-tea-hồ-` | **`may-coffee-tea-ho-soai-chek-may-son-garden`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-053`** | Nhà Nghỉ & Khách Sạn Triệu Gia Tri Tôn | Thị trấn Tri Tôn | `b62d0291-nhà-nghi-&-khách-sạn` | **`nha-nghi-khach-san-trieu-gia-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-054`** | CHẠM Coffee & Tea Tri Tôn | Thị trấn Tri Tôn | `b6a52dfa-chạm-coffee-&-tea-tr` | **`cham-coffee-tea-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-055`** | Ba Chúc | Thị trấn Ba Chúc | `ba-chuc` | **`ba-chuc`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-056`** | Tiệm Cà Phê Nhà Quê Tri Tôn | Thị trấn Tri Tôn | `bfa8bcbf-tiệm-cà-phê-nhà-quê` | **`tiem-ca-phe-nha-que-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-057`** | Con Đường Tuyến Tránh Tri Tôn (ĐT941 - ĐT948) | Thị trấn Tri Tôn | `c24278f3-con-đường-tuyến-trán` | **`con-duong-tuyen-tranh-tri-ton-dt941-dt948`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-058`** | Quán Bánh Canh Lò Rèn (>30 năm) | Thị trấn Tri Tôn | `c2a08fb2-quán-bánh-canh-lò-rè` | **`quan-banh-canh-lo-ren-30-nam`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-059`** | Nghệ Thuật Viết Kinh Lá Buông Chùa Xà Tón | Thị trấn Tri Tôn | `c4fb60f7-nghệ-thuật-viết-kinh` | **`nghe-thuat-viet-kinh-la-buong-chua-xa-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-060`** | Rồng Vàng Resort Tri Tôn | Thị trấn Tri Tôn | `c7d6fabf-rồng-vàng-resort-tri` | **`rong-vang-resort-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-061`** | Cà Phê Suối Đá Ô Tà Sóc | Xã Lương Phi | `ca-phe-suoi-da-o-ta-soc` | **`ca-phe-suoi-da-o-ta-soc`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-062`** | Cà Phê Thốt Nốt Tà Pạ View | Xã Núi Tô | `ca-phe-thot-not-ta-pa-view` | **`ca-phe-thot-not-ta-pa-view`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-063`** | Lang Lang Coffee & Tea | Thị trấn Tri Tôn | `cee4075f-lang-lang-coffee-&-t` | **`lang-lang-coffee-tea`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-064`** | Chùa Xà Tón Tri Tôn | Tri Tôn | `chua-xa-ton-tri-ton` | **`chua-xa-ton-tri-ton`** | `PILOT_ALIAS_MAPPING` | `MERGE_ALIAS_TO_CANONICAL` | `OPEN_FOR_REVIEW` |
| **`CRQ-065`** | Cổng Trời Chùa Koh Kas (Chùa Tual Prasat) | Xã Châu Lăng | `cong-troi-chua-koh-kas-tual-prasat` | **`cong-troi-chua-koh-kas-chua-tual-prasat`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-066`** | Cổng trời Tri Tôn - An Giang | Tri Tôn | `cong-troi-tri-ton-an-giang` | **`cong-troi-tri-ton-an-giang`** | `PILOT_ALIAS_MAPPING` | `MERGE_ALIAS_TO_CANONICAL` | `OPEN_FOR_REVIEW` |
| **`CRQ-067`** | Quy Coffee House Tri Tôn (Quý's Coffee) | Thị trấn Tri Tôn | `d1bd3ece-quy-coffee-house-tri` | **`quy-coffee-house-tri-ton-quys-coffee`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-068`** | NY Coffee & Tea Tri Tôn | Thị trấn Tri Tôn | `d2759ee4-ny-coffee-&-tea-tri-` | **`ny-coffee-tea-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-069`** | Cánh Đồng Thốt Nốt Châu Lăng | Xã Châu Lăng | `d3e73741-cánh-đồng-thốt-nốt-c` | **`canh-dong-thot-not-chau-lang`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-070`** | Cầu Khỉ Giữa Cánh Đồng Thốt Nốt | Xã Cô Tô | `d8731ae3-cầu-khỉ-giữa-cánh-đồ` | **`cau-khi-giua-canh-dong-thot-not`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-071`** | Đặc sản Gà đốt Ô Thum Tri Tôn | Xã Ô Lâm | `dac-san-ga-dot-o-thum-tri-ton` | **`dac-san-ga-dot-o-thum-tri-ton`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-072`** | Gà Đốt Ô Thum Kim Suổl | Xã Ô Lâm | `dec77a0e-gà-đốt-ô-thum-kim-su` | **`ga-dot-o-thum-kim-suol`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-073`** | Chùa Hàng Còng (Krăng Krốch) | Xã Châu Lăng | `df20bed8-chùa-hàng-còng-(krăn` | **`chua-hang-cong-krang-kroch`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-074`** | Drink & Hammock Chill | Thị trấn Tri Tôn | `drink-hammock-chill` | **`drink-hammock-chill`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-075`** | Quán Đu Đủ Đâm Rina & Ly Ly (Cầu Cây Me Châu Lăng) | Xã Châu Lăng | `e13b2eab-quán-đu-đủ-đâm-&-cán` | **`quan-du-du-dam-rina-ly-ly-cau-cay-me-chau-lang`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-076`** | Con Đường Tre Tầm Vông Ô Tà Sóc | Xã Lương Phi | `e4772f7e-con-đường-tre-tầm-vô` | **`con-duong-tre-tam-vong-o-ta-soc`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-077`** | Chùa Tam Bửu Ba Chúc | Thị trấn Ba Chúc | `e563b663-chùa-tam-bửu-ba-chúc` | **`chua-tam-buu-ba-chuc`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-078`** | Núi Dài (Ngọa Long Sơn) | Thị trấn Ba Chúc | `e5e1c51e-núi-dài-(ngọa-long-s` | **`nui-dai-ngoa-long-son`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-079`** | Lò Bánh Bò Thốt Nốt Út Dứt | Thị trấn Tri Tôn | `ea5a3976-lò-bánh-bò-thốt-nốt-` | **`lo-banh-bo-thot-not-ut-dut`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-080`** | Gà Đốt Ô Thum Thảo Nguyên | Xã Ô Lâm | `ec52a58c-gà-đốt-ô-thum-thảo-n` | **`ga-dot-o-thum-thao-nguyen`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-081`** | Bãi Thả Diều Hoàng Hôn Tri Tôn | Thị trấn Tri Tôn | `f0d6fe60-bãi-thả-diều-hoàng-h` | **`bai-tha-dieu-hoang-hon-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-082`** | Quán Bò Nướng Trái Trúc Tri Tôn | Thị trấn Tri Tôn | `f229bec5-quán-bò-nướng-trái-t` | **`quan-bo-nuong-trai-truc-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-083`** | Cung Đường Ven Vách Đá Núi Dài (Lương Phi) | Thị trấn Tri Tôn | `f424d6ea-cung-đường-ven-vách-` | **`cung-duong-ven-vach-da-nui-dai-luong-phi`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-084`** | Windy Hill Coffee & Homestay Tri Tôn | Xã Núi Tô | `f7f5ca30-windy-hill-coffee-&-` | **`windy-hill-coffee-homestay-tri-ton`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-085`** | Lò Đường Thốt Nốt Nguyên Chất Châu Lăng - Út Huệ | Xã Châu Lăng | `fefbce27-lò-đường-thốt-nốt-ng` | **`lo-duong-thot-not-nguyen-chat-chau-lang-ut-hue`** | `UUID_PREFIX_STANDARDIZATION` | `STANDARDIZE_SLUG` | `OPEN_FOR_REVIEW` |
| **`CRQ-086`** | Hàng Thốt Nốt Khmer Trái Tim | Xã An Tức | `hang-thot-not-khmer-trai-tim` | **`cay-thot-not-trai-tim`** | `PILOT_ALIAS_MAPPING` | `STANDARDIZE_COMMUNE_GLOSSARY_AND_MERGE_ALIAS` | **`RESOLVED`** ✅ |
| **`CRQ-087`** | Hồ Soài So | Xã Núi Tô | `ho-soai-so` | **`ho-soai-so`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-088`** | Hồ Tà Pạ Núi Tô Tri Tôn An Giang | Tri Tôn | `ho-ta-pa-nui-to-tri-ton-an-giang` | **`ho-ta-pa-nui-to-tri-ton-an-giang`** | `PILOT_ALIAS_MAPPING` | `MERGE_ALIAS_TO_CANONICAL` | `OPEN_FOR_REVIEW` |
| **`CRQ-089`** | Hồ Tà Pạ Tri Tôn An Giang | Tri Tôn | `ho-ta-pa-tri-ton-an-giang` | **`ho-ta-pa-tri-ton-an-giang`** | `PILOT_ALIAS_MAPPING` | `MERGE_ALIAS_TO_CANONICAL` | `OPEN_FOR_REVIEW` |
| **`CRQ-090`** | Khu Di Tích Lịch Sử Đồi Tức Dụp & Hang C6 | Xã An Tức | `khu-di-tich-doi-tuc-dup-hang-c6` | **`khu-di-tich-lich-su-doi-tuc-dup-hang-c6`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-091`** | Khu giải trí bắn súng - Đồi Tức Dụp | Tri Tôn | `khu-giai-tri-ban-sung-doi-tuc-dup` | **`khu-giai-tri-ban-sung-doi-tuc-dup`** | `PILOT_ALIAS_MAPPING` | `MERGE_ALIAS_TO_CANONICAL` | `OPEN_FOR_REVIEW` |
| **`CRQ-092`** | Làng Nghề Gốm Đất Nung & Bếp Cà Ràng Cổ Truyền Ô Lâm | Xã Ô Lâm | `lang-gom-dat-nung-o-lam` | **`lang-nghe-gom-dat-nung-bep-ca-rang-co-truyen-o-lam`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-093`** | Làng Nghề Dệt Thổ Cẩm Khmer Truyền Thống Châu Lăng | Xã Châu Lăng | `lang-nghe-tho-cam-chau-lang` | **`lang-nghe-det-tho-cam-khmer-truyen-thong-chau-lang`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-094`** | NHÀ HÀNG ĂN | Thị trấn Tri Tôn | `nha-hang-an` | **`nha-hang-an`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-095`** | Nhà Thiếu Nhi Huyện Tri Tôn | Thị trấn Tri Tôn | `nha-thieu-nhi` | **`nha-thieu-nhi-huyen-tri-ton`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-096`** | Nhà Trọ Quốc tiến | Thị trấn Tri Tôn | `nha-tro-quoc-tien` | **`nha-tro-quoc-tien`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-097`** | Nhà Trưng Bày Văn Hóa Dân Tộc Khmer Tri Tôn | Thị trấn Tri Tôn | `nha-trung-bay-van-hoa-khmer-tri-ton` | **`nha-trung-bay-van-hoa-dan-toc-khmer-tri-ton`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-098`** | Quán Gà Đốt Sáu Búp Ô Thum | Xã Ô Lâm | `quan-ga-dot-sau-bup-o-thum` | **`quan-ga-dot-sau-bup-o-thum`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-099`** | Chùa Tà Miệt (Cái Nôi Khởi Nguồn Hội Đua Bò Bảy Núi) | Xã Lương Phi | `san-dua-bo-chua-ta-miet` | **`chua-ta-miet-cai-noi-khoi-nguon-hoi-dua-bo-bay-nui`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-100`** | Sân Đua Bò Nước & Bừa Ruộng Truyền Thống Chùa Rô | Xã Châu Lăng | `san-dua-bo-nuoc-chua-ro` | **`san-dua-bo-nuoc-bua-ruong-truyen-thong-chua-ro`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-101`** | Sân Đua Bò Thể Thao Tà Pạ - Soài Chek (Nơi Thi Đấu Chính Thức) | Xã Núi Tô | `san-dua-bo-ta-pa-soai-chek` | **`san-dua-bo-the-thao-ta-pa-soai-chek-noi-thi-dau-chinh-thuc`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |
| **`CRQ-102`** | Tinh Tam | Thị trấn Tri Tôn | `tinh-tam` | **`tinh-tam`** | `UNSYNCED_MASTER_DATA` | `VERIFY_AND_INGEST_TO_MASTER` | `OPEN_FOR_REVIEW` |

---

## 3. Nhật Ký Các Quyết Định Thẩm Định Đã Giải Quyết (Resolved Audit Records)

### Ticket CRQ-001 — Chùa Xà Tón (Wat Xvayton)
- **Địa điểm:** Chùa Xà Tón (Wat Xvayton) (Thị trấn Tri Tôn, Tri Tôn)
- **Quyết định:** `STANDARDIZE_AND_MERGE`
- **Canonical Slug chính thức:** `chua-xa-ton`
- **Các mã ID đã hợp nhất:** `0c1d5e83-chùa-xà-tón-(wat-xva`, `chua-xa-ton-chua-svayton`, `chua-xa-ton-tri-ton`
- **Căn cứ chứng minh:** Quyết định số 224/QĐ-BVHTT ngày 12/12/1986 của Bộ Văn hóa Thông tin xếp hạng Di tích Kiến trúc Nghệ thuật cấp Quốc gia; Xác lập kỷ lục VietKings 2006 về Kinh lá buông Satra cổ nhất Việt Nam.
- **Người phê duyệt:** `Chăm Rốch Thi` lúc `2026-09-28T18:45:00+07:00`
- **Ghi chú:** Đã thẩm định và hợp nhất 3 mã định danh dị biệt (UUID Live DB, slug kép Master CSV, và slug pilot) về canonical slug chuẩn duy nhất [chua-xa-ton].

### Ticket CRQ-035 — Hồ Đá Latina
- **Địa điểm:** Hồ Đá Latina (Xã An Hảo (Ranh giới giáp TX. Tịnh Biên), Tri Tôn)
- **Đơn vị hành chính chuẩn hóa:** `Xã An Tức` (gốc ngoài glossary: `Xã An Hảo (Ranh giới giáp TX. Tịnh Biên)`)
- **Cờ đặc thù địa giới:** `CROSS_BORDER_ATTRACTION`
- **Quyết định:** `STANDARDIZE_SLUG_AND_NORMALIZE_BOUNDARY`
- **Canonical Slug chính thức:** `ho-da-latina`
- **Các mã ID đã hợp nhất:** `831ebb34-hồ-đá-latina`
- **Căn cứ chứng minh:** Bản đồ Địa giới Hành chính Huyện Tri Tôn; Tuyến du lịch chân Núi Cấm - Tỉnh lộ 948; Quyết định số 05/2003/QĐ-UBND tỉnh An Giang về địa giới hành chính; Tuân thủ RULE 02 (15 xã/thị trấn Tri Tôn).
- **Người phê duyệt:** `Chăm Rốch Thi` lúc `2026-09-28T19:15:00+07:00`
- **Ghi chú:** Hồ Đá Latina nằm tại tọa độ (10.482, 105.002) - hoàn toàn nằm trong Bounding Box Tri Tôn [10.30 - 10.55, 104.80 - 105.15]. Lòng hồ và vách đá giáp ranh giữa Xã An Hảo (TX. Tịnh Biên) và Xã An Tức (Huyện Tri Tôn); hướng tiếp cận du lịch chính và dịch vụ đường mòn xuất phát từ địa phận Huyện Tri Tôn. Đã chuẩn hóa đơn vị hành chính thuộc Tri Tôn về 'Xã An Tức' và gắn cờ liên kết vùng CROSS_BORDER_ATTRACTION. Đồng thời thẩm định và loại trừ vĩnh viễn thực thể cào thô legacy diem-du-lich-tri-ton-12 (Lat 10.5567842 > 10.55) khỏi mọi pipeline.

### Ticket CRQ-086 — Hàng Thốt Nốt Khmer Trái Tim
- **Địa điểm:** Hàng Thốt Nốt Khmer Trái Tim (Xã An Tức, Tri Tôn)
- **Đơn vị hành chính chuẩn hóa:** `Xã An Tức` (gốc ngoài glossary: `Xã An Tức`)
- **Quyết định:** `STANDARDIZE_COMMUNE_GLOSSARY_AND_MERGE_ALIAS`
- **Canonical Slug chính thức:** `cay-thot-not-trai-tim`
- **Các mã ID đã hợp nhất:** `hang-thot-not-khmer-trai-tim`
- **Căn cứ chứng minh:** Quy chuẩn địa giới hành chính 15 xã/thị trấn Tri Tôn (RULE 02); Bảng đối soát POI Concordance; Địa danh thực tế: Cây thốt nốt hình trái tim tọa lạc tại ấp Phú Hiệp, Xã An Tức, Huyện Tri Tôn (giáp ranh Xã Ô Lâm); Khớp nối toàn diện với bản ghi chuẩn cay-thot-not-trai-tim.
- **Người phê duyệt:** `Chăm Rốch Thi` lúc `2026-09-28T20:55:00+07:00`
- **Ghi chú:** Chuẩn hóa nhãn commune ngoài glossary từ nhãn cộc 'Tri Tôn' thành danh xưng chuẩn 'Xã An Tức' theo RULE 02. Đồng thời ánh xạ alias pilot [hang-thot-not-khmer-trai-tim] về canonical slug hệ thống [cay-thot-not-trai-tim] để kế thừa trọn vẹn bộ ảnh cào pilot độ nét cao.

### Danh Mục Thực Thể Ngoại Vi Bị Loại Trừ Do Vượt Bounding Box (Out-of-Bounds Rejection Log)
- **Mã Thực Thể:** `diem-du-lich-tri-ton-12` (`ភូមិស្រែឃ្មួញ`)
- **Nguồn gốc:** Tệp cào thô lịch sử `triton_pois_table.csv` và `triton_pois_map.geojson` (bản ghi số 24)
- **Tọa độ ghi nhận:** `Latitude: 10.5567842, Longitude: 104.8948393`
- **Lý do vi phạm:** Vĩ độ `10.5567842` vượt trần Bounding Box `10.55` của Huyện Tri Tôn và vi phạm CHECK constraint `chk_places_latitude_boundary`. Đồng thời nhãn xã 'Thị trấn Tri Tôn' bị gán sai lệch nghiêm trọng.
- **Quyết định:** `REJECT_OUT_OF_BOUNDS` — Cấm tuyệt đối nạp vào Master Data sạch hoặc cơ sở dữ liệu production.
- **Người phê duyệt:** `Chăm Rốch Thi` lúc `2026-09-28T19:15:00+07:00`
