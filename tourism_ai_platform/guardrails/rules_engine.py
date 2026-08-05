import logging
import re
from typing import Tuple

logger = logging.getLogger("tourism_ai_platform.guardrails")

class GuardrailsEngine:
    """Guardrails & Compliance Enforcement Engine (No-Emoji, No-Banned-Terms)."""

    @staticmethod
    def validate_content(text: str) -> Tuple[bool, str]:
        # Rule 1: No Emojis
        emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]', flags=re.UNICODE)
        if emoji_pattern.search(text):
            return False, "Violation: Contains Emoji"

        # Rule 2: No 'Huyện Tri Tôn'
        if "Huyện Tri Tôn" in text:
            return False, "Violation: Contains banned term 'Huyện Tri Tôn'"

        return True, "Valid"
