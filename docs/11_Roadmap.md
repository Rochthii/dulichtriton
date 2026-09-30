# 11. LỘ TRÌNH TRIỂN KHAI (ROADMAP)

> **Trạng thái:** roadmap lịch sử. Không dùng tài liệu này làm authority cho production readiness, số lượng POI, địa giới hành chính hoặc kiến trúc runtime. Điều phối remediation đang hiệu lực: [13_TWO_STREAM_EXECUTION_BOARD.md](13_TWO_STREAM_EXECUTION_BOARD.md); chi tiết task: [12_PRODUCTION_REMEDIATION_PLAN.md](12_PRODUCTION_REMEDIATION_PLAN.md).
>
> Các phase bên dưới được giữ để bảo toàn bối cảnh phát triển; chỉ được cập nhật sau khi Decision Gates G1/G2 trong remediation plan được chốt.

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
