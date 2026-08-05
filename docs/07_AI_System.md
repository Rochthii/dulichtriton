# 07. HỆ THỐNG AI & CHATBOT (AI SYSTEM & RAG)

## 1. Kiến trúc RAG Pipeline

```
User Prompt ──► Standardize NFC ──► Intent Classification & NER
                                          │
                                          ▼
                                Vector Search (pgvector)
                                          │
                                          ▼
                                Context Construction
                                          │
                                          ▼
                                LLM Generator (Gemini / OpenAI)
                                          │
                                          ▼
                                JSON Structured Response + Video Matcher
```

## 2. Các thành phần chính
* **NFC Normalization**: Chuẩn hóa tiếng Việt NFC trước khi vectorization và lưu trữ.
* **Intent & NER Parser**: Nhận diện ý định (`place_info`, `food_info`, `itinerary_plan`, `stay_info`) & trích xuất tên địa danh Tri Tôn.
* **Video Matcher**: Khớp từ khóa địa danh với CSDL `videos` để gắn `embed_url` TikTok/YouTube vào câu trả lời.
* **Fallback Strategy**: Không bịa dữ liệu ngoài 82 địa điểm master. Nếu thiếu thông tin, phản hồi minh bạch và gợi ý liên quan.
