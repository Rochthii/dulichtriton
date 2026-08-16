# RULE 01: PRODUCTION REAL — NO MOCK / NO FAKE / NO PLACEHOLDER

## Nguyên Tắc Cốt Lõi:
Hệ thống là Production Real 100%, phục vụ du khách thực tế và trách nhiệm thể chế lâu dài.

## 5 Yêu Cầu Bắt Buộc:
1. **Không Demo / Không Fake**: Tuyệt đối không để lại nút bấm giả, dữ liệu hardcoded hay luồng giả lập.
2. **1 Hành động UI = 1 Thao tác Backend**: Mọi nút bấm đều gọi API thật, ghi dữ liệu vào Supabase DB.
3. **Tính toàn vẹn dữ liệu**: Dữ liệu phải được kiểm thực, lưu trữ và khôi phục atomic.
4. **Bảo mật Server-side**: Phân quyền RBAC kiểm soát ở tầng API/DB, không chỉ ẩn trên UI.
5. **Quy tắc dứt khoát**: Nếu một tính năng chưa thể triển khai an toàn 100%, **KHÔNG ĐƯỢC PHÉP TỒN TẠI TRÊN UI**.
