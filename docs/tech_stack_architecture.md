# BỘ CÔNG NGHỆ TOÀN CẢNH & KIẾN TRÚC TỐI ƯU HÓA (DU LỊCH TRI TÔN AI)

---

## 🎯 1. ĐÁNH GIÁ KIẾN TRÚC & ĐIỀU CHỈNH CHUYÊN GIA

Nền tảng **Du Lịch Tri Tôn** được thiết kế theo tiêu chuẩn **Software Architect**, đảm bảo mở rộng linh hoạt khi hệ thống phát triển lớn, không bị phụ thuộc vào một nhà cung cấp LLM duy nhất và sẵn sàng cho các tính năng AI nâng cao (Tối ưu hóa tuyến đường, Reranking RAG, Map Clustering).

```
[ Frontend: Next.js 14 App Router (Vercel) ]
                 │
                 ▼
[ Backend: FastAPI Gateway (Python 3.11) ]
                 │
 ┌───────────────┼───────────────────────────────┐
 │               │                               │
 ▼               ▼                               ▼
[ AI Orchestrator Service ]       [ Vector & Retrieval Service ]       [ GIS & Route Service ]
 (Gemini / OpenAI / Claude)         (pgvector + Reranker)              (PostGIS + OSRM + MapLibre)
```

---

## 🛠️ 2. LỰA CHỌN CÔNG NGHỆ THEO LỚP KỸ THUẬT NÂNG CẤP

### 2.1. Lớp AI Orchestration & Multi-LLM Layer
* **AI Orchestrator Engine**: Tách rời luồng AI gọi LLM trực tiếp. Tự động Quản lý Caching, Fallback linh hoạt, Dynamic Routing và A/B Testing giữa nhiều nhà cung cấp:
  * **Primary LLM**: Google Gemini 1.5 Flash (Tốc độ siêu nhanh, phản hồi tiếng Việt mượt).
  * **Fallback LLM**: OpenAI GPT-4o / Claude 3.5 Sonnet / Qwen 2.5 (Xử lý truy vấn phức tạp hoặc phục hồi khi dịch vụ chính gián đoạn).

### 2.2. Lớp RAG & Vector Service Tách Biệt
* **Vector & Embedding Service**: Độc lập hóa hoàn toàn luồng Vectorize & Retrieval:
  $$\text{Documents} \longrightarrow \text{Chunking} \longrightarrow \text{Embedding (1536d)} \longrightarrow \text{Metadata} \longrightarrow \text{pgvector} \longrightarrow \text{Retriever} \longrightarrow \text{Cross-Encoder Reranker} \longrightarrow \text{LLM Output}$$
* **Hệ CSDL Vector**: **Supabase PostgreSQL 15 + Extension `pgvector`**.

### 2.3. Lớp GIS & Tối Ưu Hóa Tuyến Đường (Route Optimization)
* **Bộ tứ GIS hoàn chỉnh**: **Leaflet + MapLibre GL + PostGIS + OSRM (Open Source Routing Machine)**.
  * *MapLibre GL / Leaflet*: Hiển thị bản đồ tương tác mượt mà, Map Clustering & Heatmap trên di động.
  * *PostGIS Extension*: Xử lý truy vấn không gian phức tạp (Bán kính bán kính điểm ăn uống gần nhất).
  * *OSRM Service*: AI tự động tính toán & tối ưu hóa đường đi ngắn nhất giữa các điểm tham quan trong tour 2D1N.

### 2.4. Lớp Frontend Web Portal
* **Next.js 14 (App Router & React 18)**: Server-Side Rendering (SSR) & Incremental Static Regeneration (ISR) tối ưu SEO Top 1 Google.
* **TailwindCSS**: Design tokens (`#1B4D3E` Emerald Green, `#D99B26` Golden Palm).
* **Lucide React Icons**: Đảm bảo quy tắc **0% Emoji**, 100% SVG icons.

---

## 🚀 3. THỨ TỰ TRIỂN KHAI DỰ ÁN AI-FIRST (EXECUTION ORDER)

Để đảm bảo nền tảng dữ liệu vững chắc và tránh việc phải Refactor mã nguồn về sau, dự án triển khai nghiêm ngặt theo lộ trình **AI-First**:

1. **Knowledge Base (Hoàn thiện)**: Chuẩn hóa 105 địa điểm Master, video, lịch trình, nhà xe, văn hóa Khmer.
2. **Database Schema (Đang thực hiện)**: Tạo CSDL Supabase PostgreSQL + `pgvector` + `PostGIS`.
3. **Crawler**: Công cụ cào & làm sạch dữ liệu tự động 19 nhóm địa điểm.
4. **AI Flow & Orchestrator**: Triển khai 9 bước AI Pipeline & AI Orchestrator Engine (`docs/ai_workflow.md`).
5. **Backend**: Phát triển dịch vụ FastAPI REST APIs & AI Modular Services.
6. **Frontend**: Xây dựng Web Portal Next.js 14 & AI Chatbot Widget.
7. **Admin CMS**: Trang quản trị duyệt gian hàng Partner & xem Audit Logs.
8. **Deployment**: Triển khai Vercel + Supabase Production.
