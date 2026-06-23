# FastAPI digital-biomarker service (Whisper + spaCy + sentence-transformers +
# Praat). Heavy image (~GBs) due to torch/models, so it is opt-in via the "ml"
# compose profile. Models are prebaked below so first request is fast.
FROM python:3.11-slim

WORKDIR /app

# ffmpeg is required to decode/normalize audio for Whisper and Praat
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Prebake models into the image to avoid first-request download latency
RUN python -m spacy download en_core_web_sm \
    && python -c "import whisper; whisper.load_model('base')" \
    && python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
