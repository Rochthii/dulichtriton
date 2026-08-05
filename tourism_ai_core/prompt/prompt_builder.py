import logging
from typing import Dict, Any, List

logger = logging.getLogger("tourism_ai_core.prompt")

SYSTEM_PROMPT_TEMPLATE = """Bạn là Chăm Rốch Thi — Trợ lý AI Du Lịch Tri Tôn chuyên nghiệp, am hiểu sâu sắc về 105 địa điểm, ẩm thực đặc sản, văn hóa Khmer và địa lý Bảy Núi, Tri Tôn, An Giang.

QUY TẮC BẮT BUỘC:
1. KHÔNG DÙNG EMOJI trong bất kỳ câu trả lời nào (Chỉ dùng văn bản thuần túy & icon SVG).
2. KHÔNG DÙNG TỪ "Huyện Tri Tôn" — Chỉ ghi cấp Xã / Thị trấn (ví dụ: Xã Núi Tô, Xã Châu Lăng, Thị trấn Tri Tôn, Thị trấn Ba Chúc).
3. KHÔNG TỰ BỊA ĐẶT DỮ LIỆU ngoài tri thức 105 địa điểm đã được kiểm duyệt.
4. Trả lời bằng tiếng Việt tự nhiên, ấm áp, đậm chất con người An Giang bản địa.
5. Cảnh báo thời gian chế biến đối với các món đặc sản (như Gà đốt Ô Thum chờ 35-45 phút).
6. Định dạng đầu ra JSON chứa cả câu trả lời văn bản và thẻ UI Component địa điểm.
"""

class PromptBuilder:
    """Builds Dynamic Prompts combining System Directives, Context, Retrieved Docs & Guardrails."""

    @staticmethod
    def build_prompt(user_query: str, context: Dict[str, Any], retrieved_docs: List[Dict[str, Any]]) -> str:
        docs_text = "\n\n".join([f"- Document {idx+1}:\n{doc.get('content', '')}" for idx, doc in enumerate(retrieved_docs)])

        prompt = f"""{SYSTEM_PROMPT_TEMPLATE}

--- BỐI CẢNH NGUYÊN THỂ ---
- Thực thể trích xuất: {context.get('entities')}
- Mùa du lịch: {context.get('current_season')}

--- TRI THỨC TRUY VẤN (RETRIEVED KNOWLEDGE) ---
{docs_text}

--- CÂU HỎI CỦA DU KHÁCH ---
"{user_query}"

Hãy đưa ra câu trả lời xuất sắc, chính xác và có cấu trúc cho du khách.
"""
        logger.info(f"Generated Dynamic Prompt with {len(retrieved_docs)} Knowledge Passages.")
        return prompt
