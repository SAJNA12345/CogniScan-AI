"""Configuration for the agentic service.

Uses Groq Cloud via its OpenAI-compatible API. A single Groq-hosted model backs
every agent by default; per-role overrides are kept so you can point the
reasoning agent at a larger model than the fast/safety agent.
"""

import os

_DEFAULT_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


class Settings:
    # Groq Cloud credentials (OpenAI-compatible endpoint).
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")

    # Per-role models. Reasoning/conductor need tool calling (llama-3.3-70b
    # supports it); the fast guardrail uses the cheap instant model.
    MODEL_REASONING = os.getenv("MODEL_REASONING", _DEFAULT_MODEL)
    MODEL_CONDUCTOR = os.getenv("MODEL_CONDUCTOR", _DEFAULT_MODEL)
    MODEL_FAST = os.getenv("MODEL_FAST", "llama-3.1-8b-instant")

    # Speech/biomarker service (Phase 2)
    ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://ml-service:8000")

    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

    @property
    def llm_enabled(self) -> bool:
        return bool(self.GROQ_API_KEY)


settings = Settings()
