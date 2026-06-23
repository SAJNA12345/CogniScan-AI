<div align="center">

# 🧠 CogniScan AI

### Intelligent Dementia Early-Screening & Cognitive Assessment Platform

A microservice-based healthcare web application that combines interactive cognitive
assessments, a conversational **AI interviewer**, and **speech-biomarker analysis**
to surface early signals of cognitive decline — with a clean, professional
bento-style interface.

![License](https://img.shields.io/badge/license-Educational-blue)
![Frontend](https://img.shields.io/badge/frontend-React%2018%20%2B%20TypeScript-0ea5e9)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-3c873a)
![AI](https://img.shields.io/badge/AI-Groq%20(Llama%203.x)-f55036)
![ML](https://img.shields.io/badge/ML-Whisper%20%2B%20spaCy%20%2B%20Praat-8b5cf6)
![Deploy](https://img.shields.io/badge/deploy-Docker%20Compose-2496ed)

</div>

> ⚠️ **Medical disclaimer.** CogniScan is a **screening-signal** tool for **educational and
> research purposes only**. It does **not** provide a diagnosis and is **not** a substitute
> for evaluation by a qualified healthcare professional.

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Architecture](#-architecture)
4. [Tech Stack](#-tech-stack)
5. [Repository Structure](#-repository-structure)
6. [Prerequisites](#-prerequisites)
7. [Quick Start (Docker — recommended)](#-quick-start-docker--recommended)
8. [Configuration & Environment Variables](#-configuration--environment-variables)
9. [Running Locally Without Docker](#-running-locally-without-docker)
10. [API Reference](#-api-reference)
11. [AI & ML Configuration](#-ai--ml-configuration)
12. [Using the App](#-using-the-app)
13. [Operations & Common Commands](#-operations--common-commands)
14. [Troubleshooting](#-troubleshooting)
15. [Security Notes](#-security-notes)
16. [Roadmap](#-roadmap)
17. [License](#-license)

---

## 🔭 Overview

CogniScan is built as **five cooperating services** behind a single web entry point:

- A **React + TypeScript** single-page app (bento-box UI).
- A **Node/Express** API that owns auth, user data, results, and acts as the **gateway**
  to the AI services (the browser only ever talks to `/api`).
- A Python **agent-service** that runs a multi-agent LLM pipeline on **Groq Cloud**
  (orchestrator → clinical reasoner → safety reviewer → reporter), plus a conversational
  cognitive interviewer.
- A Python **ml-service** that extracts **speech biomarkers** from audio
  (Whisper transcription + acoustic/linguistic features + a calibrated risk estimate).
- **MongoDB** for persistence.

Everything is containerised and orchestrated with Docker Compose.

---

## ✨ Key Features

| Area | Description |
|------|-------------|
| 🤖 **AI Cognitive Interview** | A conversational, MoCA/MMSE-inspired screening that adapts to the user's answers in real time (orientation, memory recall, attention, language). |
| 🎙️ **Voice Biomarkers** | Record/upload speech → Whisper transcription → acoustic (pause ratio, speech rate, pitch, jitter/shimmer) + linguistic (lexical richness, idea density, semantic coherence) features → explainable risk signal, reviewed and summarised by AI agents. |
| 🧠 **Cognitive Test** | MMSE-inspired questions: orientation, recall, attention/calculation, language, with automatic scoring. |
| 🧾 **Functional Assessment** | Daily-living MCQs with severity classification. |
| ⚠️ **Risk Factor Analysis** | Modifiable & non-modifiable dementia risk factors → Low / Moderate / High interpretation. |
| 📊 **Analytics Dashboard** | Bento-grid dashboard with score rings, trends (Recharts), and progress tracking. |
| 📄 **PDF Report** | Downloadable, medical-style report (jsPDF + html2canvas). |
| 🔐 **Authentication** | JWT-based signup/login; all data and AI endpoints are token-protected. |

---

## 🏗 Architecture

```
                         ┌──────────────────────────────────────┐
   Browser  ──────────►  │  frontend  (nginx, React+TS SPA)     │  http://localhost:5173
                         │  serves the app, proxies /api → backend
                         └───────────────┬──────────────────────┘
                                         │ /api/*
                                         ▼
                         ┌──────────────────────────────────────┐
                         │  backend  (Node/Express, JWT)        │  http://localhost:5000
                         │  auth · users · results · API gateway│
                         └──────┬───────────────────┬───────────┘
                                │ AGENT_SERVICE_URL  │ (Mongoose)
                                ▼                    ▼
        ┌───────────────────────────────┐   ┌──────────────────┐
        │ agent-service (FastAPI)        │   │ MongoDB          │ :27017
        │ multi-agent pipeline on Groq   │   └──────────────────┘
        │ /interview · /assess · /audio  │
        └───────────────┬────────────────┘  http://localhost:8080
                        │ ML_SERVICE_URL (audio only)
                        ▼
        ┌───────────────────────────────┐
        │ ml-service (FastAPI)           │  http://localhost:8001
        │ Whisper + biomarkers + risk    │  (opt-in: `ml` profile)
        └───────────────────────────────┘
                        │
                        ▼  (external)
                  Groq Cloud API  ·  https://api.groq.com/openai/v1
```

**Request flows**
- **AI interview:** browser → `POST /api/agent/interview` → backend → agent-service `/interview/turn` → Groq.
- **Voice:** browser (mic) → `POST /api/agent/assess-audio` (multipart) → backend → agent-service `/assess/audio` → ml-service `/analyze` (Whisper + biomarkers) → agent-service runs the 4-agent pipeline on Groq → report.
- **Tests/results:** browser → `/api/results`, `/api/auth/*`, `/api/user/*` → backend → MongoDB.

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, **TypeScript**, Vite, Tailwind CSS, **Framer Motion**, **lucide-react**, Recharts, jsPDF, html2canvas, React Router |
| **Backend** | Node.js 20, Express 5, Mongoose, JWT (`jsonwebtoken`), bcryptjs, multer |
| **Agent service** | Python 3.11, FastAPI, OpenAI SDK (pointed at Groq's OpenAI-compatible API) |
| **ML service** | Python 3.11, FastAPI, OpenAI-Whisper, spaCy, sentence-transformers, praat-parselmouth, ffmpeg |
| **AI provider** | **Groq Cloud** — `llama-3.3-70b-versatile` (reasoning/conductor), `llama-3.1-8b-instant` (fast guardrail) |
| **Database** | MongoDB 7 |
| **Infra** | Docker, Docker Compose, nginx |

---

## 📂 Repository Structure

```
CogniScan-AI/
├── docker-compose.yml          # Orchestrates all services
├── .env.example                # Root env (consumed by docker compose)
│
├── frontend/                   # React + TypeScript SPA (bento UI)
│   ├── src/
│   │   ├── components/         # Layout, Navbar, ui.tsx (Bento, Button, …)
│   │   ├── lib/                # api.ts (auth fetch), utils.ts
│   │   ├── pages/              # Home, CognitiveInterview, Voice, tests, etc.
│   │   ├── App.tsx, main.tsx
│   │   └── index.css           # Tailwind entry
│   ├── tailwind.config.js · postcss.config.js · tsconfig.json
│   ├── nginx.conf · Dockerfile
│
├── backend/                    # Express API + gateway
│   ├── controllers/            # auth, user, result, agent (gateway)
│   ├── routes/  ·  models/  ·  middleware/  ·  config/
│   ├── server.js · Dockerfile · .env.example
│
├── agent-service/              # FastAPI multi-agent layer (Groq)
│   ├── main.py · pipeline.py · llm.py · tools.py · prompts.py
│   ├── schemas.py · config.py · requirements.txt · Dockerfile
│
├── ml-service/                 # FastAPI speech-biomarker service
│   ├── main.py · schemas.py
│   ├── biomarkers/             # acoustic.py, linguistic.py, scoring.py
│   ├── requirements.txt · Dockerfile
│
└── README.md
```

---

## ✅ Prerequisites

**Recommended path (Docker):**
- [Docker](https://docs.docker.com/get-docker/) **and** Docker Compose v2+
- A **Groq Cloud API key** — free at <https://console.groq.com> (keys start with `gsk_`)
- ~6 GB free disk (the ml-service image bundles Whisper + models)

**Bare-metal path (no Docker)** additionally needs:
- Node.js 20+, Python 3.11+, MongoDB 7, and **ffmpeg** (for the voice feature)

---

## 🚀 Quick Start (Docker — recommended)

### 1. Clone

```bash
git clone <your-repo-url> CogniScan-AI
cd CogniScan-AI
```

### 2. Configure secrets

Create a root `.env` (Docker Compose reads it automatically). Copy the template:

```bash
cp .env.example .env
```

Then edit `.env` and set **at least**:

```dotenv
JWT_SECRET=<any-long-random-string>
GROQ_API_KEY=gsk_your_real_groq_key_here
```

> Generate a strong JWT secret:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. Start the stack

```bash
# Core stack (mongo + backend + agent-service + frontend) — interview + tests work:
docker compose up -d --build

# Full stack INCLUDING the heavy ML service (required for Voice Biomarkers):
docker compose --profile ml up -d --build
```

The first build of the ml-service downloads Whisper/spaCy/embedding models, so it can
take several minutes. Subsequent starts are fast.

### 4. Open the app

| Service | URL | Notes |
|---------|-----|-------|
| **Web app** | <http://localhost:5173> | Main entry point |
| Backend API | <http://localhost:5000> | Direct API access |
| Agent service | <http://localhost:8080> | `/health`, `/docs` |
| ML service | <http://localhost:8001> | `/health`, `/docs` (only with `--profile ml`) |
| MongoDB | `localhost:27017` | — |

### 5. First steps

1. Open <http://localhost:5173> → **Sign up** → you'll be logged in automatically.
2. From the dashboard, try **🤖 AI Interview** or **🎙️ Voice Biomarkers**.
3. Verify the AI layer is wired up: `curl http://localhost:5000/api/agent/health`
   → should show `"llm_enabled": true` and the Groq model names.

---

## ⚙️ Configuration & Environment Variables

Docker Compose substitutes these from the root **`.env`**. Sensible defaults are baked
into `docker-compose.yml`, so only `GROQ_API_KEY` (and ideally `JWT_SECRET`) are required.

| Variable | Used by | Default | Purpose |
|----------|---------|---------|---------|
| `GROQ_API_KEY` | agent-service, backend | _(empty)_ | **Required.** Groq Cloud key (`gsk_…`). Without it, agent endpoints return `503`. |
| `JWT_SECRET` | backend | dev placeholder | Secret used to sign JWTs. **Change in production.** |
| `JWT_EXPIRES_IN` | backend | `1d` | Token lifetime. |
| `GROQ_MODEL` | agent-service | `llama-3.3-70b-versatile` | Default Groq model. |
| `MODEL_REASONING` | agent-service | `llama-3.3-70b-versatile` | Clinical reasoner (needs tool calling). |
| `MODEL_CONDUCTOR` | agent-service | `llama-3.3-70b-versatile` | Orchestrator + reporter. |
| `MODEL_FAST` | agent-service | `llama-3.1-8b-instant` | Safety guardrail. |
| `GROQ_BASE_URL` | agent-service | `https://api.groq.com/openai/v1` | Groq OpenAI-compatible endpoint. |
| `ALLOWED_ORIGINS` | agent-service, ml-service | `*` | CORS allow-list. |
| `WHISPER_MODEL` | ml-service | `base` | Whisper size (`tiny`/`base`/`small`/…). |
| `MONGO_URI` | backend | `mongodb://mongo:27017/dementiaDB` | Mongo connection (set by compose). |
| `ML_SERVICE_URL` | backend, agent-service | `http://ml-service:8000` | Internal ML endpoint. |
| `AGENT_SERVICE_URL` | backend | `http://agent-service:8000` | Internal agent endpoint. |

> 🔒 **Never commit real secrets.** `.env`, `.env.*`, and `backend/.env` are gitignored.

---

## 🖥 Running Locally Without Docker

Run each service in its own terminal. (Mongo is easiest via Docker even in this mode:
`docker run -d -p 27017:27017 --name mongo mongo:7`.)

**1) ml-service** (only needed for Voice; requires `ffmpeg`)
```bash
cd ml-service
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --port 8001
```

**2) agent-service**
```bash
cd agent-service
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export GROQ_API_KEY=gsk_your_key
export ML_SERVICE_URL=http://localhost:8001
uvicorn main:app --port 8080
```

**3) backend**
```bash
cd backend
cp .env.example .env        # then edit values
npm install
# In backend/.env (or env): JWT_SECRET=..., MONGO_URI=mongodb://127.0.0.1:27017/dementiaDB,
#   AGENT_SERVICE_URL=http://localhost:8080, ML_SERVICE_URL=http://localhost:8001
node server.js              # → http://localhost:5000
```

**4) frontend**
```bash
cd frontend
npm install
npm run dev                 # → http://localhost:5173 (Vite proxies /api → :5000)
```

> The Vite dev server proxies `/api` to `http://localhost:5000` by default
> (override with `VITE_API_PROXY` in `frontend/.env`).

---

## 🔌 API Reference

All `/api/*` routes are served by the backend. Auth routes return a JWT; protected
routes require `Authorization: Bearer <token>`.

### Auth & data (backend)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | — | Create account (`{ name, email, password }`). |
| `POST` | `/api/auth/login` | — | Log in → `{ token, user }`. |
| `GET`  | `/api/results` | ✅ | List the user's assessment results. |
| `POST` | `/api/results` | ✅ | Save a result (`{ score, total, type }`). |
| `PUT`  | `/api/user/update` | ✅ | Update profile. |
| `DELETE` | `/api/user/delete` | ✅ | Delete account. |

### AI gateway (backend → agent-service)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/api/agent/health` | — | Agent service status + configured models. |
| `POST` | `/api/agent/interview` | ✅ | One interview turn (`{ history: [{role, content}] }`). |
| `POST` | `/api/agent/assess` | ✅ | Full assessment over signals (scores/risk factors). |
| `POST` | `/api/agent/assess-audio` | ✅ | Multipart audio → biomarkers + AI report. |

### Internal services (not exposed publicly; useful for debugging)
- **agent-service** (`:8080`): `GET /health`, `POST /interview/turn`, `POST /assess`, `POST /assess/audio`, interactive docs at `/docs`.
- **ml-service** (`:8001`): `GET /health`, `POST /analyze` (multipart audio → biomarkers), docs at `/docs`.

---

## 🧠 AI & ML Configuration

**Provider:** the agent-service talks to **Groq Cloud** through its OpenAI-compatible
API (so it uses the `openai` SDK with `base_url=https://api.groq.com/openai/v1`).

**Models** (override via env): reasoning/conductor use `llama-3.3-70b-versatile`
(supports tool calling, which the clinical reasoner needs); the safety guardrail uses
`llama-3.1-8b-instant`. See current model IDs at <https://console.groq.com/docs/models>.

**Multi-agent pipeline** (`agent-service/pipeline.py`):
`orchestrator` → `clinical_reasoner` (grounded via a `lookup_guideline` tool) →
`safety_guardrail` (enforces "screening, not diagnosis") → `reporter`
(patient + clinician reports). Every step is returned in a `trace` for transparency.

> **Robustness note:** Groq's Llama models occasionally emit a malformed tool call
> (HTTP 400 `tool_use_failed`). `llm.py` retries once and then falls back to a
> tool-less call so the pipeline always completes.

**Speech biomarkers** (`ml-service/biomarkers/`): Whisper transcribes the audio;
`acoustic.py` derives timing (pauses, speech rate) and voice quality (pitch, jitter,
shimmer via Praat); `linguistic.py` computes lexical richness, idea density, syntactic
complexity, and semantic coherence; `scoring.py` produces an explainable, calibrated
heuristic risk band.

---

## 📖 Using the App

- **Sign up / Log in** — required for assessments and AI features.
- **Dashboard** — bento overview with your latest score, average, recent trend, and
  shortcuts to every feature.
- **AI Interview** — chat through an adaptive cognitive screening; ends automatically.
- **Voice Biomarkers** — grant **microphone permission** (works on `localhost`, which
  browsers treat as a secure origin), record ~30–60s, then **Analyse** — or upload an
  audio file. Requires the ml-service (`--profile ml`).
- **Cognitive / Functional / Risk tests** — answer questions; scores are saved to your
  history.
- **Progress / Results / Report** — view trends, history, and download a PDF report.

---

## 🛠 Operations & Common Commands

```bash
docker compose ps                          # service status
docker compose logs -f agent-service       # follow a service's logs
docker compose --profile ml up -d --build  # (re)build & start everything incl. ML
docker compose up -d --build backend frontend   # rebuild only specific services
docker compose restart agent-service       # restart one service
docker compose down                        # stop & remove containers (keeps DB volume)
docker compose down -v                     # also delete the MongoDB volume (wipes data)
```

---

## 🔧 Troubleshooting

| Symptom | Cause & Fix |
|---------|-------------|
| Agent calls return **503** | `GROQ_API_KEY` not set. Put it in the root `.env` and `docker compose up -d` again. Check `curl localhost:5000/api/agent/health`. |
| Voice analysis fails / times out | ml-service isn't running. Start with `docker compose --profile ml up -d --build`; confirm `curl localhost:8001/health`. |
| Microphone doesn't record | Browser permission denied, or not a secure origin. Use `http://localhost:5173` (localhost is allowed) and grant mic access — or use **Upload audio instead**. |
| `port is already allocated` | Another process uses 5173/5000/8080/8001/27017. Stop it or change the host port mapping in `docker-compose.yml`. |
| Login fails / no data | MongoDB not reachable. Check `docker compose logs mongo` and that `MONGO_URI` is correct. |
| ml-service image build is slow | Expected on first build (downloads Whisper/spaCy/embedding models). It's cached afterward. |
| Groq `tool_use_failed` errors in logs | Handled automatically (retry + tool-less fallback). Safe to ignore. |

---

## 🔐 Security Notes

- Change `JWT_SECRET` to a strong random value before any non-local deployment.
- Restrict `ALLOWED_ORIGINS` (CORS) to your real frontend origin in production.
- Keep `GROQ_API_KEY` out of version control — it lives only in gitignored `.env` files.
- The backend is the single public surface; agent-service and ml-service are intended to
  stay on the internal Docker network.
- Audio uploads are capped (25 MB) and streamed straight to the agent-service in memory.

---

## 🗺 Roadmap

- Front-end audio waveform & playback for recorded samples
- Doctor/Admin dashboard with cohort analytics
- Persisting AI interview & voice results to user history
- Model fine-tuning / a trained classifier to replace the heuristic risk baseline
- Cloud deployment manifests (Kubernetes / managed Mongo)

---

## 📜 License

Released for **educational and research use only**. Not for clinical use.
See the medical disclaimer at the top of this document.

<div align="center">

**CogniScan AI** — supporting early cognitive-health awareness through accessible,
explainable screening.

</div>
