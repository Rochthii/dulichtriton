# 11. LỘ TRÌNH TRIỂN KHAI (ROADMAP) — [ARCHIVED / ĐÃ LƯU TRỮ]

> [!WARNING]
> **TÀI LIỆU LỊCH SỬ ĐÃ BỊ THAY THẾ (SUPERSEDED & ARCHIVED)**: Tài liệu này không còn hiệu lực điều hành. Mọi quyền điều phối kế hoạch sản xuất đã chuyển giao sang [Production Remediation Plan](12_PRODUCTION_REMEDIATION_PLAN.md), [Execution Board](13_TWO_STREAM_EXECUTION_BOARD.md) và [ACTIVE_TASK.md](../ACTIVE_TASK.md).
> Các giai đoạn bên dưới chỉ được lưu trữ làm bối cảnh khảo sát sơ khai; tuyệt đối không dùng làm căn cứ triển khai runtime, số lượng POI hoặc kiến trúc production.

## Giai đoạn 1: Khảo sát & Master Data (Đã hoàn thành ✅)
* Thu thập & chuẩn hóa CSDL 82 địa điểm master (`data/tri_ton_master_cleaned.csv`).
* Xây dựng công cụ Crawler & Export GeoJSON.
* Hoàn thiện 9 tài liệu kiến thức Agent (`.agents/`).

## Giai đoạn 2: Phát triển Backend API & GIS
* Khởi tạo khung FastAPI async.
* Xây dựng CRUD API cho Places, Foods, Homestays, Map GeoJSON.
* Viết bộ kiểm tra tọa độ Bounding Box & Audit Logging.

## Giai đoạn 3: Tích hợp RAG AI Chatbot & Video Engine
* Xây dựng luồng RAG với pgvector / vector embeddings.
* Thiết lập Intent Parser & NER trích xuất địa danh Tri Tôn.
* Tích hợp Video Matcher tự động nhúng link TikTok/YouTube vào JSON response.

## Giai đoạn 4: Xây dựng Giao diện Web Portal & Chatbot Widget
* Thiết kế Web Portal Responsive Mobile-First.
* Dựng các trang: Trang chủ, Địa điểm, Đặc sản, Lưu trú, Lịch trình, Bản đồ Leaflet.
* Tích hợp Chatbot Widget tương tác trực tiếp trên Website.

## Giai đoạn 5: Kiểm thử, Tối ưu & Release
* Testing toàn bộ luồng sử dụng (Visitor, Partner, Admin).
* Tối ưu tốc độ tải trang & phản hồi Chatbot (target 2-4s).
* Triển khai hệ thống Production.

---

## 📌 Phụ Lục: Chấm Dứt Xung Đột Lộ Trình (Zero Roadmap Contention Invariant)

Kể từ khi ban hành Kế hoạch Khắc phục Sản xuất (Production Remediation Plan - P00 đến P07), hệ thống tuân thủ nghiêm ngặt nguyên tắc **Một Luồng Điều Phối Duy Nhất (Single Source of Truth for Roadmap)**:
1. **Lộ trình 5 giai đoạn sơ khai trên đã chính thức khép lại** và được lưu trữ (archived) nhằm mục đích ghi vết lịch sử nghiên cứu.
2. Mọi quyết định kỹ thuật, trạng thái các tính năng, phân rã rủi ro P0/P1, Decision Gates (G0, G1, G2, G3, G4), và kế hoạch phát hành đều được điều hành độc quyền bởi:
   - [Production Remediation Plan](12_PRODUCTION_REMEDIATION_PLAN.md) (Quy chuẩn điều hành kỹ thuật production)
   - [Two-Stream Execution Board](13_TWO_STREAM_EXECUTION_BOARD.md) (Bảng điều phối tiến độ hai luồng / thống nhất)
   - [ACTIVE_TASK.md](../ACTIVE_TASK.md) (Bảng phân công task nguyên tử trực tiếp)
