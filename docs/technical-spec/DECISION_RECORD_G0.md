# Decision Record G0 — Môi trường và owner

> Ngày chốt: 2026-09-24  
> Trạng thái: `VERIFIED` theo quan sát public, khai báo trong repository và xác nhận của người dùng trong phiên. Các giới hạn kiểm chứng được ghi rõ.

## Quyết định

1. Có một môi trường Du Lịch Tri Tôn đang public tại `https://dulichtriton.vercel.app`; trang truy cập được khi kiểm tra ngày 2026-09-24. Người dùng xác nhận deployment dùng Vercel.
2. Database dùng Supabase. Project ref cấu hình/fallback tìm thấy trong checkout là `knmlbwsmfljlabhvqfid`; người dùng xác nhận có dữ liệu thật và xác nhận hệ thống dùng Supabase.
3. Project tự công bố Chăm Rốch Thi là tác giả/nhà sáng lập và lead developer. Privacy notice trong repository nói người này thiết kế, vận hành và quản lý hệ thống. G0 ghi nhận Chăm Rốch Thi là product/project owner và platform operator dựa trên các khai báo này.
4. Có cấu hình local development (`ENV=development` trong `.env.example`). Cấu hình local trỏ cùng Supabase project ref; không có bằng chứng local dùng database riêng.
5. Không tìm thấy identifier hoặc URL staging trong checkout và nguồn public đã kiểm tra. Staging được ghi `unknown`, không kết luận là không tồn tại.

## Inventory môi trường

| Môi trường | URL / identifier | Dịch vụ và dữ liệu | Product owner | Platform owner | Evidence / giới hạn |
|---|---|---|---|---|---|
| Public web | `https://dulichtriton.vercel.app` | Vercel theo xác nhận người dùng; Supabase project ref `knmlbwsmfljlabhvqfid`; dữ liệu thật theo xác nhận người dùng | Chăm Rốch Thi — tác giả/nhà sáng lập theo [README](../../README.md) | Chăm Rốch Thi — lead developer theo [permanent memory](../../.agents/permanent_memory.md), privacy notice mô tả trực tiếp vận hành/quản lý | URL mở công khai ngày 2026-09-24. Vercel dashboard/internal project ID và production env chưa được truy cập; mapping deployment → Supabase dựa trên xác nhận người dùng và project config, chưa có dashboard proof. |
| Local development | Local checkout; không có URL public riêng | `.env.example` khai báo `ENV=development`; config local trỏ Supabase ref `knmlbwsmfljlabhvqfid` | Chăm Rốch Thi — theo project ownership declaration | Chăm Rốch Thi — theo platform operator declaration | Config local quan sát trong checkout; không xác nhận local runtime đang chạy tại thời điểm chốt. |
| Staging | `unknown` | Chưa xác định project hoặc dữ liệu | Chăm Rốch Thi — owner cấp project theo declaration hiện có | Chăm Rốch Thi — operator cấp project theo declaration hiện có | Không tìm thấy staging URL/identifier; không suy diễn staging có hoặc không. |

## Phê duyệt và nguồn

- Phê duyệt: người dùng trong phiên Codex xác nhận “CÓ, HẾT” và yêu cầu lập record ngày 2026-09-24. Tên/role tài khoản người dùng không được cung cấp cho agent; owner được ghi theo các khai báo của project.
- Owner evidence: [README](../../README.md), [permanent memory](../../.agents/permanent_memory.md), [privacy notice source](../../frontend/src/app/privacy/page.tsx).
- Runtime evidence: [public site](https://dulichtriton.vercel.app), [Vercel build config](../../vercel.json), [Supabase fallback config](../../frontend/src/lib/dataCache.ts). Local `.env.local` chỉ được đọc trường `NEXT_PUBLIC_SUPABASE_URL`; không ghi hoặc xuất secret.
- AI route đề xuất: `Luna · xhigh` theo W0 / Luồng B. AI thực dùng: `Codex GPT-6` (effort identifier không được cung cấp).

## Trạng thái claim và giới hạn

- `VERIFIED`: public site tồn tại và truy cập được tại URL trên ngày 2026-09-24.
- `VERIFIED` theo owner attestation: deployment dùng Vercel, database dùng Supabase và có dữ liệu thật.
- `VERIFIED` theo project declaration: Chăm Rốch Thi là tác giả/nhà sáng lập và lead developer; privacy notice tự nhận người này trực tiếp vận hành/quản lý hệ thống.
- `UNKNOWN`: Vercel internal project ID, production environment variables trên dashboard, staging URL/project và trạng thái runtime local tại thời điểm chốt.
- Record này không xác nhận security, RLS, production readiness, canonical dataset hoặc claim dữ liệu du lịch.
