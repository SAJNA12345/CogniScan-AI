"""
CogniScan ML / digital-biomarker service.

This service owns speech-based biomarker extraction. It exposes a stable
contract (`POST /analyze`) that the agentic backend calls as a tool. Phase 0
establishes the boundary and response schema; Phase 2 fills in the real
acoustic + linguistic biomarker models and a calibrated risk estimate.
"""

import os
import tempfile
from collections import Counter

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="CogniScan ML Service", version="0.1.0")

# Allow the backend (and, in dev, the frontend) to call this service.
_allowed = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Whisper is heavy; load it lazily so the service boots instantly for the
# boundary/health checks and only pays the cost on first real transcription.
_model = None


def _get_model():
    global _model
    if _model is None:
        import whisper

        _model = whisper.load_model(os.getenv("WHISPER_MODEL", "base"))
    return _model


# ---- Response contract (Phase 2 fills these with real biomarker models) ----


class SpeechFeatures(BaseModel):
    """Acoustic biomarkers. TODO(phase2): pause ratio, speech rate, jitter."""

    duration_sec: float | None = None
    pause_ratio: float | None = None
    speech_rate_wpm: float | None = None


class LinguisticFeatures(BaseModel):
    word_count: int
    unique_words: int
    type_token_ratio: float
    max_repetition: int
    # TODO(phase2): idea density, semantic coherence (embeddings), perplexity.


class AnalyzeResponse(BaseModel):
    transcript: str
    speech: SpeechFeatures
    linguistic: LinguisticFeatures
    # TODO(phase2): calibrated risk score + uncertainty live here.
    risk_score: float | None = None
    uncertainty: float | None = None


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(file: UploadFile = File(...)):
    # Persist upload to a temp file for the transcriber.
    suffix = os.path.splitext(file.filename or "")[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        audio_path = tmp.name

    try:
        result = _get_model().transcribe(audio_path)
        text = result.get("text", "").strip()
    finally:
        os.unlink(audio_path)

    words = text.split()
    word_count = len(words)
    unique_words = len(set(words))
    freq = Counter(words)

    return AnalyzeResponse(
        transcript=text,
        speech=SpeechFeatures(),
        linguistic=LinguisticFeatures(
            word_count=word_count,
            unique_words=unique_words,
            type_token_ratio=(unique_words / word_count) if word_count else 0.0,
            max_repetition=max(freq.values()) if freq else 0,
        ),
    )
