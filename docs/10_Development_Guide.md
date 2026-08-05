# 10. HƯỚNG DẪN PHÁT TRIỂN (DEVELOPMENT GUIDE)

## 1. Cài đặt môi trường
```bash
# 1. Clone & mở thư mục dự án
cd e:\Projects\Project_ca_nhan\dulichtriton

# 2. Tạo virtualenv & kích hoạt (Windows)
python -m venv venv
.\venv\Scripts\activate

# 3. Cài đặt dependencies
pip install -r requirements.txt
```

## 2. Quy chuẩn Code (Coding Standards)
1. **Tiếng Việt NFC**: Mọi chuỗi văn bản lưu CSDL/xuất file phải được chuẩn hóa `unicodedata.normalize("NFC", text)`.
2. **Xuất File**: Đăng ký CSV luôn dùng `utf-8-sig`, JSON dùng `utf-8`.
3. **Bounding Box**: Mọi tọa độ phải nằm trong Latitude [10.25, 10.55] và Longitude [104.85, 105.15].
4. **Không dùng "Huyện Tri Tôn"**: Sử dụng tên Xã/Thị trấn trực thuộc.
5. **No Demo / Mock Code**: Code sản phẩm thực tế, có validation và xử lý ngoại lệ rõ ràng.
