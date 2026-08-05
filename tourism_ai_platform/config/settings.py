import os
from pydantic import BaseModel

class PlatformSettings(BaseModel):
    app_name: str = "Du Lịch Tri Tôn AI Platform"
    version: str = "10.2.0-PRODUCTION"
    primary_llm: str = "gemini-2.5-flash"
    fallback_llm: str = "gpt-4o"
    bounding_box: list = [10.25, 10.55, 104.85, 105.15]
    banned_terms: list = ["Huyện Tri Tôn"]
    no_emoji_rule: bool = True

settings = PlatformSettings()
