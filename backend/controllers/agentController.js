// Thin gateway between the React frontend and the Python agent-service.
// The browser only ever talks to the Express API (same origin behind nginx);
// these handlers forward to the agent-service and relay its response, so the
// agentic endpoints inherit the app's JWT auth.

const { AGENT_SERVICE_URL } = require("../config/env");

const base = AGENT_SERVICE_URL.replace(/\/$/, "");

async function forwardPost(path, body) {
  const resp = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const text = await resp.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  return { status: resp.status, data };
}

// One turn of the conversational Cognitive Interviewer (stateless — the client
// passes the running history each call).
exports.interviewTurn = async (req, res) => {
  try {
    const { status, data } = await forwardPost("/interview/turn", {
      history: Array.isArray(req.body?.history) ? req.body.history : [],
    });
    res.status(status).json(data);
  } catch (err) {
    console.error("agent /interview error:", err.message);
    res.status(502).json({ message: "Agent service unavailable", detail: err.message });
  }
};

// Full multi-agent assessment over already-extracted signals (scores, risk
// factors, optional speech biomarkers).
exports.assess = async (req, res) => {
  try {
    const { status, data } = await forwardPost("/assess", req.body || {});
    res.status(status).json(data);
  } catch (err) {
    console.error("agent /assess error:", err.message);
    res.status(502).json({ message: "Agent service unavailable", detail: err.message });
  }
};

// Speech assessment: forward the uploaded audio (multipart) to the agent-service
// /assess/audio, which extracts biomarkers via the ml-service and runs the
// multi-agent pipeline. Uses Node's global FormData/Blob/fetch (Node 18+).
exports.assessAudio = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No audio file uploaded" });
    const form = new FormData();
    const blob = new Blob([req.file.buffer], {
      type: req.file.mimetype || "application/octet-stream",
    });
    form.append("file", blob, req.file.originalname || "recording.webm");

    const resp = await fetch(base + "/assess/audio", { method: "POST", body: form });
    const text = await resp.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }
    res.status(resp.status).json(data);
  } catch (err) {
    console.error("agent /assess-audio error:", err.message);
    res.status(502).json({ message: "Agent service unavailable", detail: err.message });
  }
};

// Unauthenticated passthrough of the agent-service health (handy for debugging
// whether the LLM key is wired up).
exports.health = async (req, res) => {
  try {
    const resp = await fetch(base + "/health");
    res.status(resp.status).json(await resp.json());
  } catch (err) {
    res.status(502).json({ message: "Agent service unavailable", detail: err.message });
  }
};
