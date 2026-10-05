# 01. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

## 1. Tên dự án & Định vị
* **Tên dự án**: DU LỊCH TRI TÔN (Trợ lý AI & Cổng Thông tin Du lịch Tri Tôn)
* **Định vị**: Nền tảng du lịch thông minh hỗ trợ du khách tra cứu thông tin, xem video thực tế (TikTok/YouTube) và lập lịch trình cá nhân hóa tại Tri Tôn, An Giang.

## 2. Vấn đề giải quyết
* Thông tin du lịch Tri Tôn còn phân tán, thiếu thông tin trực quan.
* Du khách tốn thời gian tìm video thực tế và tự lên lịch trình.
* Thiếu công cụ hỏi-đáp bằng ngôn ngữ tự nhiên tích hợp bản đồ và video.

## 3. Mục tiêu cốt lõi
* **Web Portal**: Cung cấp giao diện tra cứu địa điểm, đặc sản ẩm thực, homestay/khách sạn, lễ hội văn hóa.
* **AI Chatbot**: Trả lời câu hỏi ngôn ngữ tự nhiên kết hợp RAG và kho tri thức chuẩn tắc (Canonical Verified POIs). Theo quy chuẩn Canonical Manifest v1.0.0 (Source: `data/canonical/canonical_manifest.json`, Schema: `CANONICAL-POI-SCHEMA-V1`), hệ thống bảo đảm chỉ nạp các bản ghi đã xác minh 100% (hiện tại: 1 POI Canonical Verified đầy đủ `chua-xa-ton`) vào factual retrieval context, kết hợp phân tầng đối chiếu với kho dữ liệu khảo sát địa lý đang được thẩm định tuần tự theo Review Queue.
* **Nhúng Video**: Tự động khớp và hiển thị video trải nghiệm trực quan ngay trong khung chat và trang chi tiết địa điểm.

## 4. Đối tượng sử dụng
* **Du khách (Visitor)**: Tìm địa điểm, quán ăn, nơi ở, xem video, lên lịch trình 1D/2N1Đ.
* **Đối tác (Partner)**: Cập nhật thông tin quán ăn, homestay, dịch vụ địa phương.
* **Quản trị viên (Admin)**: Kiểm duyệt nội dung, quản lý CSDL địa điểm, duyệt video nhúng.

## 5. Chuẩn tắc Dữ liệu & Giới hạn Claim (Canonical Data Authority)
* **Canonical Manifest Version**: `v1.0.0` (Schema: `CANONICAL-POI-SCHEMA-V1`)
* **Nguồn chuẩn tắc (Source of Truth)**: `data/canonical/canonical_manifest.json` (phê duyệt bởi Lead Technical & Cultural Auditor Chăm Rốch Thi tại Decision Gate G2).
* **Số lượng POI Canonical Đã Xác Minh**: `1` POI (`Chùa Xà Tón`, mã review `PVR-CHUA-XA-TON-2026`).
* **Kho dữ liệu khảo sát thô**: `1,592` bản ghi đã làm sạch sơ bộ tại `data/tri_ton_master_cleaned.csv` (chưa gắn nhãn verified trên production, được xử lý dần qua Review Queue).
* **Cam kết Production**: 0% số liệu suy diễn/fake; hệ thống và tài liệu tuyệt đối không tuyên bố vượt quá số lượng bản ghi đã được phê duyệt trong Canonical Manifest.
