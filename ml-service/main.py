from fastapi import FastAPI, File, UploadFile
import shutil
import whisper
import nltk
from collections import Counter

app = FastAPI()

model = whisper.load_model("base")

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    with open("audio.wav", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Speech to text
    result = model.transcribe("audio.wav")
    text = result["text"]

    # NLP Analysis
    words = text.split()
    word_count = len(words)
    unique_words = len(set(words))

    freq = Counter(words)
    repetition = max(freq.values()) if freq else 0

    return {
        "text": text,
        "analysis": {
            "word_count": word_count,
            "unique_words": unique_words,
            "repetition": repetition
        }
    }