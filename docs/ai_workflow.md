# LUỒNG XỬ LÝ AI & KIẾN TRÚC AI ORCHESTRATION (DU LỊCH TRI TÔN)

---

## 🚀 1. KIẾN TRÚC TỔNG QUAN AI ORCHESTRATOR

Hệ thống **Du Lịch Tri Tôn AI** không phụ thuộc trực tiếp vào bất kỳ một mô hình LLM đơn lẻ nào. AI Backend được thiết kế theo kiến trúc **AI Orchestration Layer** linh hoạt, có khả năng Caching, Fallback tự động, A/B Testing và Semantic Routing giữa nhiều nhà cung cấp LLM (Gemini, OpenAI, Claude, Qwen).

```
User Query
    │
    ▼
Frontend Next.js (Chat Widget / Search Bar)
    │
    ▼
FastAPI API Gateway
    │
    ▼
AI Orchestrator Engine ──(Cache / Routing / Fallback)
    │
 ┌──┴──────────────────────┬──────────────────────┬──────────────────────┐
 │                         │                      │                      │
Gemini 1.5 Flash        OpenAI GPT-4o        Claude 3.5 Sonnet       Qwen 2.5
(Primary LLM)          (Complex Reasoning)    (Cultural Knowledge)    (Offline / Local)
```

---

## 🔄 2. QUY TRÌNH XỬ LÝ CÂU HỎI AI CHUẨN 9 BƯỚC (AI ASSISTANT FLOW)

```
[1. User Input] ──> [2. Intent Detection] ──> [3. Entity Extraction]
                                                     │
[6. Knowledge Ranking] <── [5. Hybrid Vector Search] <── [4. Context Builder]
         │
         ▼
[7. Prompt Engine] ──> [8. LLM + Orchestrator] ──> [9. Response Validator & JSON Formatter]
                                                                 │
                                                                 ▼
                                                    [Frontend Dynamic Components]
```

### Chi tiết 9 bước thực thi:

1. **User Input (Tiếp nhận câu hỏi)**: Tiếp nhận văn bản hoặc giọng nói từ người dùng (ví dụ: *"Tầm trưa 12h ăn gì ở Tri Tôn ngon gần Hồ Tà Pạ?"*).
2. **Intent Detection (Nhận diện ý định)**: Phân loại Intent (Tìm quán ăn / Gợi ý lịch trình / Hỏi đường đi / Giá vé / Lễ hội Khmer).
3. **Entity Extraction (Trích xuất thực thể NER)**: Nhận diện các thực thể (Thời gian: `12:00`, Địa điểm: `Hồ Tà Pạ`, Loại hình: `Ăn trưa / Quán ăn`).
4. **Context Builder (Dựng bối cảnh)**: Tổng hợp lịch sử hội thoại, vị trí GPS hiện tại của du khách và thông tin mùa du lịch (Mùa nước nổi / Mùa lúa chín).
5. **Hybrid Vector Search (Tìm kiếm kết hợp)**: Truy vấn kết hợp BM25 (từ khóa chính xác) + Vector Embedding Cosine Distance trên Supabase `pgvector`.
6. **Knowledge Ranking & Reranking**: Đánh giá điểm relevance và xếp hạng Top 3 địa điểm/quán ăn phù hợp nhất.
7. **Prompt Builder (Dựng Prompt chuyên sâu)**: Đưa bối cảnh tri thức 105 địa điểm Master, quy tắc văn hóa và Ràng buộc "No Emoji" vào Prompt template.
8. **LLM + Orchestrator Execution**: AI Orchestrator chuyển câu hỏi đến LLM tối ưu (Gemini 1.5 Flash), tự động fallback sang GPT-4o nếu LLM chính bận.
9. **Response Validator & JSON Formatter**: Kiểm tra đầu ra AI, validate định dạng Structured JSON chứa câu trả lời văn bản, Thẻ UI Component địa điểm và Video TikTok Shorts embed.

---

## 📚 3. CHUẨN RAG PIPELINE (RETRIEVAL-AUGMENTED GENERATION)

```
Master Documents (105 Spots)
         │
         ▼
Document Chunking (Phân đoạn văn bản)
         │
         ▼
Embedding Service (Tạo Vector 1536d)
         │
         ▼
Metadata Tagging (Gán nhãn Xã/Thị trấn, Loại hình)
         │
         ▼
Supabase pgvector (Lưu trữ Vector)
         │
         ▼
Hybrid Retriever (Truy vấn kết hợp)
         │
         ▼
Cross-Encoder Reranker (Tái xếp hạng kết quả)
         │
         ▼
System Prompt & LLM Generator
         │
         ▼
Structured Output Component (JSON Rendering)
```

---

## 🧩 4. CẤU TRÚC MODULAR AI MODULES

Hệ thống AI Backend được chia nhỏ thành các Module độc lập dễ bảo trì:

```
tourism_ai_core/
├── intent/               # Intent Detection Engine
├── ner/                  # Entity Extraction (NER) Service
├── context/              # Context Builder & Session Memory
├── vector/               # Vector Search & Embedding Service
├── ranking/              # Hybrid Retriever & Cross-Encoder Reranker
├── prompt/               # Dynamic Prompt Engine & Guardrails
├── orchestrator/         # LLM Multi-provider Orchestrator (Gemini/OpenAI/Claude)
├── validation/           # Output Response Validator & JSON Formatter
└── services/
    ├── chat_service.py           # Chat Assistant Service
    ├── recommendation_service.py # Recommendation Engine
    ├── trip_planner_service.py   # AI Itinerary Generator
    ├── route_planner_service.py  # Route Optimization (OSRM/PostGIS)
    └── video_finder_service.py   # TikTok / Shorts Video Finder
```
