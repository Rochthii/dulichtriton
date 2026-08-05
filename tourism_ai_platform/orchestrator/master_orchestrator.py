import logging
import json
from typing import Dict, Any
from tourism_ai_platform.config.settings import settings
from tourism_ai_platform.adapters.llm_adapters import GeminiAdapter, OpenAIAdapter
from tourism_ai_platform.guardrails.rules_engine import GuardrailsEngine

logger = logging.getLogger("tourism_ai_platform.orchestrator")

class MasterPlatformOrchestrator:
    """Master Orchestrator for tourism_ai_platform package."""

    def __init__(self):
        self.gemini = GeminiAdapter()
        self.openai = OpenAIAdapter()

    async def execute_query(self, query: str) -> Dict[str, Any]:
        logger.info(f"Processing Platform Query: '{query}'")
        raw_output = await self.gemini.generate(query)
        is_valid, msg = GuardrailsEngine.validate_content(raw_output)

        if not is_valid:
            logger.warning(f"Guardrail Flagged: {msg}. Retrying fallback...")
            raw_output = await self.openai.generate(query)

        return json.loads(raw_output)
