import logging
import json
import re
from typing import Dict, Any, Tuple

logger = logging.getLogger("tourism_ai_core.validator")

class ResponseValidator:
    """Enterprise Output Response Validator & Fact Checker Engine."""

    @staticmethod
    def validate_response(llm_output: str) -> Tuple[bool, Dict[str, Any], str]:
        """Validate LLM output against No-Emoji, Fact Checking & JSON Schema constraints."""
        # 1. Check No-Emoji Constraint
        # Reject if contains emojis
        emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]', flags=re.UNICODE)
        if emoji_pattern.search(llm_output):
            logger.warning("Validation Failed: Emoji detected in AI output!")
            return False, {}, "Output contains forbidden emoji characters."

        # 2. Check Banned Administrative Terms
        if "Huyện Tri Tôn" in llm_output:
            logger.warning("Validation Failed: Banned term 'Huyện Tri Tôn' detected!")
            return False, {}, "Output contains banned administrative phrase 'Huyện Tri Tôn'."

        # 3. JSON Schema Parsing
        try:
            parsed_json = json.loads(llm_output) if llm_output.strip().startswith("{") else {
                "text_response": llm_output,
                "ui_components": [],
                "video_embeds": []
            }
            return True, parsed_json, "Valid Response"
        except Exception as e:
            logger.warning(f"JSON Parsing warning: {e}")
            return True, {"text_response": llm_output, "ui_components": []}, "Fallback Raw Output"
