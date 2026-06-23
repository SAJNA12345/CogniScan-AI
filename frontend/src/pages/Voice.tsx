import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Square, Upload, Activity, FileText, Waves, Loader2 } from "lucide-react";
import Layout from "../components/Layout";
import { Bento, Button, Badge, PageHeading } from "../components/ui";
import { apiUpload } from "../lib/api";
import { isAuthed } from "../lib/utils";

type Risk = { risk_band?: string; risk_score?: number; uncertainty?: number };
type Assess = {
  biomarkers?: {
    transcript?: string;
    acoustic?: Record<string, number | null>;
    linguistic?: Record<string, number | null>;
    risk?: Risk;
  };
  report?: { patient_report?: string; clinician_report?: string };
};

const PROMPT =
  "Please describe, in as much detail as you can, everything you did yesterday — from waking up to going to sleep. Speak naturally for about 30–60 seconds.";

export default function Voice() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Assess | null>(null);
  const [error, setError] = useState("");

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    setError("");
    setResult(null);
    setBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => {
        setBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone access was denied. You can upload an audio file instead.");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const analyze = async () => {
    if (!blob) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", blob, "recording.webm");
      const data = await apiUpload("/api/agent/assess-audio", form);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Analysis failed. Make sure the ML service is running.");
    } finally {
      setLoading(false);
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setBlob(f);
      setResult(null);
      setError("");
    }
  };

  if (!isAuthed()) {
    return (
      <Layout>
        <Bento className="mx-auto max-w-md text-center">
          <Mic className="mx-auto text-brand-500" size={32} />
          <h2 className="mt-3 text-xl font-bold">Voice Biomarkers</h2>
          <p className="mt-2 text-ink-soft">
            Please <Link to="/login" className="font-semibold text-brand-600">log in</Link> to record a sample.
          </p>
        </Bento>
      </Layout>
    );
  }

  const risk = result?.biomarkers?.risk;
  const band = (risk?.risk_band || "").toLowerCase();
  const bandTone = band === "high" ? "red" : band === "moderate" ? "amber" : "green";

  return (
    <Layout>
      <PageHeading
        icon={<Mic size={22} />}
        title="Voice Biomarkers"
        subtitle="Speech-based screening — acoustic & linguistic markers analysed by AI."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recorder */}
        <Bento className="lg:col-span-1 flex flex-col items-center text-center">
          <p className="mb-5 text-sm text-ink-soft">{PROMPT}</p>

          <motion.button
            onClick={recording ? stopRecording : startRecording}
            whileTap={{ scale: 0.95 }}
            className={`relative grid h-28 w-28 place-items-center rounded-full text-white shadow-lg transition-colors ${
              recording ? "bg-rose-500" : "bg-brand-500 hover:bg-brand-600"
            }`}
          >
            {recording && (
              <motion.span
                className="absolute inset-0 rounded-full bg-rose-400"
                animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}
            {recording ? <Square size={34} /> : <Mic size={36} />}
          </motion.button>

          <div className="mt-4 font-mono text-2xl font-bold text-ink">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </div>
          <p className="text-xs text-ink-faint">
            {recording ? "Recording… tap to stop" : blob ? "Sample ready" : "Tap to record"}
          </p>

          <div className="mt-5 w-full space-y-3">
            <Button onClick={analyze} disabled={!blob || loading} className="w-full">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} />}
              {loading ? "Analysing…" : "Analyse sample"}
            </Button>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink-soft hover:bg-slate-50">
              <Upload size={16} /> Upload audio instead
              <input type="file" accept="audio/*" className="hidden" onChange={onFile} />
            </label>
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">⚠️ {error}</p>}
        </Bento>

        {/* Results */}
        <div className="lg:col-span-2 space-y-5">
          {!result && !loading && (
            <Bento className="grid h-full min-h-[260px] place-items-center text-center">
              <div className="text-ink-faint">
                <Waves className="mx-auto mb-2 opacity-60" size={32} />
                Record or upload a sample, then analyse to see results.
              </div>
            </Bento>
          )}

          {loading && (
            <Bento className="grid h-full min-h-[260px] place-items-center">
              <div className="flex items-center gap-2 text-ink-soft">
                <Loader2 className="animate-spin text-brand-500" size={20} />
                Transcribing & analysing speech…
              </div>
            </Bento>
          )}

          {result && (
            <>
              <div className="grid grid-cols-2 gap-5">
                <Bento className="flex flex-col justify-center">
                  <span className="label">Risk signal</span>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge tone={bandTone as any}>{(risk?.risk_band || "n/a").toUpperCase()}</Badge>
                    {typeof risk?.risk_score === "number" && (
                      <span className="text-2xl font-extrabold text-ink">
                        {Math.round((risk.risk_score || 0) * 100)}%
                      </span>
                    )}
                  </div>
                  {typeof risk?.uncertainty === "number" && (
                    <p className="mt-1 text-xs text-ink-faint">
                      Uncertainty {Math.round(risk.uncertainty * 100)}%
                    </p>
                  )}
                </Bento>
                <Bento>
                  <span className="label">Transcript</span>
                  <p className="mt-2 max-h-24 overflow-y-auto text-sm text-ink-soft">
                    {result.biomarkers?.transcript || "—"}
                  </p>
                </Bento>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <MetricCard title="Acoustic" data={result.biomarkers?.acoustic} />
                <MetricCard title="Linguistic" data={result.biomarkers?.linguistic} />
              </div>

              {result.report?.patient_report && (
                <Bento>
                  <div className="mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-brand-600" />
                    <h3 className="font-bold text-ink">Summary</h3>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                    {result.report.patient_report}
                  </p>
                </Bento>
              )}
            </>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-faint">
        Heuristic screening signal — not a diagnosis.
      </p>
    </Layout>
  );
}

function MetricCard({ title, data }: { title: string; data?: Record<string, number | null> }) {
  const entries = Object.entries(data || {})
    .filter(([, v]) => v !== null && v !== undefined)
    .slice(0, 6);
  return (
    <Bento>
      <span className="label">{title}</span>
      <dl className="mt-3 space-y-2">
        {entries.length === 0 && <p className="text-sm text-ink-faint">No data</p>}
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-sm">
            <dt className="text-ink-soft">{k.replace(/_/g, " ")}</dt>
            <dd className="font-semibold text-ink">{typeof v === "number" ? Math.round(v * 1000) / 1000 : String(v)}</dd>
          </div>
        ))}
      </dl>
    </Bento>
  );
}
