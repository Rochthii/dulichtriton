import logging
import json
from typing import Dict, Any

logger = logging.getLogger("tourism_ai_platform.adapters")

class BaseLLMAdapter:
    async def generate(self, prompt: str) -> str:
        raise NotImplementedError

class GeminiAdapter(BaseLLMAdapter):
    async def generate(self, prompt: str) -> str:
        logger.info("Executing Gemini 1.5 Flash Adapter...")
        response = {
            "text_response": "Chào bạn! Đến Tri Tôn bạn nhất định nên thử món Gà Đốt Ô Thum nổi tiếng tại Xã Ô Lâm và ghé thăm ngắm cảnh Hồ Tà Pạ tuyệt đẹp nhé!",
            "ui_components": [
                {"type": "place_card", "name": "Hồ Tà Pạ", "commune": "Xã Núi Tô"},
                {"type": "food_card", "name": "Gà Đốt Ô Thum", "commune": "Xã Ô Lâm"}
            ]
        }
        return json.dumps(response, ensure_ascii=False)

class OpenAIAdapter(BaseLLMAdapter):
    async def generate(self, prompt: str) -> str:
        logger.info("Executing OpenAI GPT-4o Fallback Adapter...")
        return json.dumps({"text_response": "OpenAI Fallback output", "ui_components": []})

class ClaudeAdapter(BaseLLMAdapter):
    async def generate(self, prompt: str) -> str:
        logger.info("Executing Claude 3.5 Sonnet Adapter...")
        return json.dumps({"text_response": "Claude Cultural output", "ui_components": []})
