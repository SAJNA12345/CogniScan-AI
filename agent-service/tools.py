"""Tools available to the agents.

- analyze_speech: forwards audio to the Phase 2 ml-service /analyze endpoint.
- lookup_guideline: a small retrieval stub over dementia-screening clinical
  guidance (NIA-AA / DSM-5 framing). In production this becomes RAG over a
  vetted guideline corpus; the agent-facing contract stays the same.
"""

from __future__ import annotations

import httpx

from config import settings

# Minimal stand-in knowledge base for grounded reasoning. Keys are topics the
# reasoning agent can request via the lookup_guideline tool.
GUIDELINES = {
    "speech_biomarkers": (
        "Reduced speech rate, increased pause ratio, lower lexical richness "
        "(TTR/MATTR), reduced idea/propositional density, and reduced semantic "
        "coherence are associated with cognitive decline (cf. ADReSS, connected "
        "speech literature). No single feature is diagnostic."
    ),
    "risk_factors": (
        "Modifiable risk factors include hypertension, diabetes, smoking, "
        "physical inactivity, poor sleep, and social isolation; non-modifiable "
        "include age and family history (cf. Lancet Commission on dementia "
        "prevention)."
    ),
    "screening_scope": (
        "Cognitive screening instruments (MMSE/MoCA-style) stratify risk and "
        "indicate need for formal evaluation. They do not establish a diagnosis, "
        "which requires clinical assessment, history, and often imaging/labs."
    ),
    "staging": (
        "Cognitive status is commonly framed as normal, subjective cognitive "
        "decline, mild cognitive impairment (MCI), and dementia, on a continuum."
    ),
}

LOOKUP_GUIDELINE_TOOL = {
    "type": "function",
    "function": {
        "name": "lookup_guideline",
        "description": (
            "Retrieve vetted clinical-screening guidance for a topic to ground "
            "reasoning. Use before making interpretive claims."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "topic": {
                    "type": "string",
                    "enum": list(GUIDELINES.keys()),
                    "description": "Guideline topic to retrieve.",
                }
            },
            "required": ["topic"],
        },
    },
}


def lookup_guideline(args: dict) -> dict:
    topic = (args or {}).get("topic", "")
    return {"topic": topic, "guidance": GUIDELINES.get(topic, "No guidance found.")}


def analyze_speech(audio_bytes: bytes, filename: str) -> dict:
    """Call the Phase 2 ml-service to extract speech biomarkers."""
    url = settings.ML_SERVICE_URL.rstrip("/") + "/analyze"
    files = {"file": (filename or "audio.wav", audio_bytes, "application/octet-stream")}
    with httpx.Client(timeout=180.0) as client:
        resp = client.post(url, files=files)
        resp.raise_for_status()
        return resp.json()
