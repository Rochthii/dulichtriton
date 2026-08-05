# 03. DANH SÁCH USE CASES (USE CASES OVERVIEW)

> Chi tiết phân rã 4 cấp độ (Level 0 - Level 4) xem tại [docs/use_cases_architecture.md](file:///e:/Projects/Project_ca_nhan/dulichtriton/docs/use_cases_architecture.md).

## 1. Tác nhân (Actors)
* **Du khách (Visitor)**: Người tra cứu, xem video, hỏi AI Chatbot, lưu lịch trình.
* **Đối tác (Partner)**: Chủ quán ăn, homestay cập nhật thông tin dịch vụ.
* **Quản trị viên (Admin)**: Quản lý địa điểm, kiểm duyệt nội dung, xem báo cáo audit log.

## 2. Các Module Use Case chính
* **UC01 - Khám phá Du lịch**: Xem trang chủ, danh sách địa điểm, ẩm thực, lưu trú, bản đồ.
* **UC02 - AI Assistant**: Hỏi đáp tự nhiên, trích xuất địa danh, nhận câu trả lời dạng JSON UI Cards.
* **UC03 - AI Trip Planner**: Tạo lịch trình tự động 1 ngày, 2 ngày 1 đêm tối ưu khoảng cách.
* **UC04 - Bản đồ GIS**: Hiển thị vị trí 82 địa điểm master trên bản đồ tương tác.
* **UC05 - Video Engine**: Khớp và phát video TikTok/YouTube thực tế theo địa điểm.
* **UC06 - Quản lý Tài khoản**: Đăng ký, đăng nhập, lưu lịch trình yêu thích.
* **UC07 - Partner Portal**: Đăng ký gian hàng/dịch vụ địa phương.
* **UC08 - Admin Control Center**: Quản trị dữ liệu 82 địa điểm, duyệt video, audit logs.
