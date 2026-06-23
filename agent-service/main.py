"""
CogniScan Agent Service (Phase 1).

A multi-agent orchestration layer over Groq Cloud (Llama models) that conducts
and interprets cognitive screening:
  - POST /interview/turn  conversational Cognitive Interviewer (stateless)
  - POST /assess          full pipeline over already-extracted signals
  - POST /assess/audio    extract speech biomarkers (ml-service) then assess

Agents run on tiered Groq-hosted models and every step is returned in `trace`.
"""

import pipeline
from config import settings
from llm import LLMUnavailable
from schemas import (
    AssessRequest,
    AssessResponse,
    InterviewTurnRequest,
    InterviewTurnResponse,
)
from tools import analyze_speech

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CogniScan Agent Service", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _require_llm():
    if not settings.llm_enabled:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY not configured. Set it to enable the agents.",
        )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "llm_enabled": settings.llm_enabled,
        "models": {
            "reasoning": settings.MODEL_REASONING,
            "conductor": settings.MODEL_CONDUCTOR,
            "fast": settings.MODEL_FAST,
        },
    }


@app.post("/interview/turn", response_model=InterviewTurnResponse)
def interview_turn(req: InterviewTurnRequest):
    _require_llm()
    try:
        history = [m.model_dump() for m in req.history]
        return pipeline.run_interview_turn(history)
    except LLMUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/assess", response_model=AssessResponse)
def assess(req: AssessRequest):
    _require_llm()
    try:
        return pipeline.run_full_assessment(req.model_dump())
    except LLMUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/assess/audio", response_model=AssessResponse)
async def assess_audio(
    file: UploadFile = File(...),
    cognitive_score: float | None = None,
    functional_score: float | None = None,
):
    _require_llm()
    try:
        biomarkers = analyze_speech(await file.read(), file.filename or "audio.wav")
        inputs = {
            "speech": biomarkers,
            "transcript": biomarkers.get("transcript"),
            "cognitive_score": cognitive_score,
            "functional_score": functional_score,
        }
        return pipeline.run_full_assessment(inputs)
    except LLMUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e))
