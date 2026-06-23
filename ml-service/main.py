"""
CogniScan ML / digital-biomarker service.

Owns speech-based biomarker extraction. `POST /analyze` accepts an audio
recording, transcribes it (Whisper), extracts acoustic + linguistic
biomarkers, and returns an explainable, calibrated dementia-risk signal.

The agentic backend (Phase 1) calls this as a tool. Heavy models load lazily
and are cached after first use (and prebaked in the Docker image).
"""

import os
import subprocess
import tempfile

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from biomarkers import acoustic, linguistic, scoring
from schemas import AnalyzeResponse

app = FastAPI(title="CogniScan ML Service", version="0.2.0")

_allowed = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None


def _get_model():
    global _model
    if _model is None:
        import whisper

        _model = whisper.load_model(os.getenv("WHISPER_MODEL", "base"))
    return _model


def _to_wav(src_path: str) -> str:
    """Normalize any uploaded audio to 16 kHz mono WAV for Praat/Whisper."""
    wav_path = src_path + ".16k.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-i", src_path, "-ac", "1", "-ar", "16000", wav_path],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return wav_path


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or "")[1] or ".bin"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    wav_path = None
    try:
        tmp.write(await file.read())
        tmp.close()

        try:
            wav_path = _to_wav(tmp.name)
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=400, detail="Unsupported or corrupt audio")

        result = _get_model().transcribe(wav_path)
        text = (result.get("text") or "").strip()
        segments = result.get("segments") or []

        ling = linguistic.extract(text)
        acou = acoustic.extract(wav_path, segments, ling.get("word_count", 0))
        risk = scoring.score(acou, ling)

        return AnalyzeResponse(transcript=text, acoustic=acou, linguistic=ling, risk=risk)
    finally:
        for p in (tmp.name, wav_path):
            if p and os.path.exists(p):
                os.unlink(p)
