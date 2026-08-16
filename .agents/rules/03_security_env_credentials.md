# RULE 03: BẢO MẬT BIẾN MÔI TRƯỜNG & 0% HARDCODED CREDENTIALS

## Nguyên Tắc Cốt Lõi:
Bảo mật tuyệt đối thông tin xác thực, tài khoản API Keys và chuỗi kết nối Database.

## Quy Định Bắt Buộc:
1. **0% Hardcoded Credentials**:
   - Tuyệt đối KHÔNG ghi cứng API Key (Gemini, Groq, OpenRouter, Supabase, Cloudinary) vào code TSX, TS, Python hay SQL.
2. **Nạp Động 100%**:
   - Mọi khóa bảo mật phải được nạp qua `process.env.*` từ tệp `.env.local` hoặc `.env` (được bảo vệ qua `.gitignore`).
3. **Bảo Vệ Tài Khoản Trả Phí**:
   - Khóa chặt các nhà cung cấp như OpenRouter chỉ gọi các model miễn phí (`:free`), tuyệt đối không làm phát sinh chi phí trừ vào số dư tài khoản.
