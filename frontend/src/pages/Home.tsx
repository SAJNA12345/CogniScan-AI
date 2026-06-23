import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Bot,
  Mic,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  ArrowRight,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Layout from "../components/Layout";
import { Bento, Badge, ScoreRing } from "../components/ui";
import { apiGet } from "../lib/api";
import { getUser, isAuthed } from "../lib/utils";

type Result = { type?: string; score?: number; total?: number; createdAt?: string };

const features = [
  { to: "/interview", icon: Bot, title: "AI Interview", desc: "Conversational AI-led cognitive screening", accent: true },
  { to: "/voice", icon: Mic, title: "Voice Biomarkers", desc: "Speech analysis for early signals" },
  { to: "/cognitive", icon: Brain, title: "Cognitive Test", desc: "Memory, logic & attention" },
  { to: "/risk", icon: AlertTriangle, title: "Risk Factors", desc: "Understand dementia risk" },
  { to: "/functional", icon: ClipboardList, title: "Functional", desc: "Daily-life independence" },
];

export default function Home() {
  const navigate = useNavigate();
  const user = getUser();
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    if (!isAuthed()) return;
    apiGet("/api/results")
      .then((d) => setResults(Array.isArray(d) ? d : d?.results ?? []))
      .catch(() => {});
  }, []);

  const scored = results.filter((r) => typeof r.score === "number");
  const latest = scored[scored.length - 1]?.score ?? 0;
  const avg =
    scored.length > 0
      ? Math.round(scored.reduce((s, r) => s + (r.score || 0), 0) / scored.length)
      : 0;
  const chartData = scored.slice(-8).map((r, i) => ({ name: r.type || `#${i + 1}`, score: r.score }));

  return (
    <Layout wide>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Badge tone="brand">
          <Activity size={13} /> Cognitive health dashboard
        </Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome to CogniScan"}
        </h1>
        <p className="mt-1 text-ink-soft">
          Early dementia screening through interactive assessments and AI analysis.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {/* Hero AI interview */}
        <Bento
          interactive
          onClick={() => navigate("/interview")}
          className="md:col-span-2 lg:col-span-2 flex flex-col justify-between bg-gradient-to-br from-brand-500 to-brand-700 text-white"
          delay={0.02}
        >
          <div>
            <Bot size={30} />
            <h3 className="mt-4 text-2xl font-bold">Start an AI Interview</h3>
            <p className="mt-1 max-w-sm text-brand-50/90">
              A conversational, MoCA/MMSE-inspired screening that adapts to your answers.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 font-semibold">
            Begin session <ArrowRight size={18} />
          </span>
        </Bento>

        {/* Latest score ring */}
        <Bento className="flex flex-col items-center justify-center text-center" delay={0.06}>
          <span className="label mb-3">Latest score</span>
          <ScoreRing value={latest} label="/ 100" />
        </Bento>

        {/* Average */}
        <Bento className="flex flex-col justify-center" delay={0.1}>
          <span className="label">Average</span>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-extrabold text-ink">{avg}</span>
            <span className="mb-1 text-ink-faint">/ 100</span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Across {scored.length} assessment{scored.length === 1 ? "" : "s"}
          </p>
        </Bento>

        {/* Feature cards */}
        {features.map((f, i) => (
          <Bento
            key={f.to}
            interactive
            onClick={() => navigate(f.to)}
            delay={0.12 + i * 0.04}
            className={f.accent ? "bg-brand-50/60" : undefined}
          >
            <span
              className={`grid h-11 w-11 place-items-center rounded-2xl ${
                f.accent ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600"
              }`}
            >
              <f.icon size={20} />
            </span>
            <h3 className="mt-4 font-bold text-ink">{f.title}</h3>
            <p className="mt-0.5 text-sm text-ink-soft">{f.desc}</p>
          </Bento>
        ))}

        {/* Progress chart */}
        <Bento className="md:col-span-2 lg:col-span-3" delay={0.2}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-brand-600" />
              <h3 className="font-bold text-ink">Recent progress</h3>
            </div>
            <button
              onClick={() => navigate("/progress")}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View all
            </button>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e6eaf0", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: "#14b8a6" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-[180px] place-items-center text-sm text-ink-faint">
              No assessments yet — take one to see your trend.
            </div>
          )}
        </Bento>

        {/* Results shortcut */}
        <Bento interactive onClick={() => navigate("/results")} delay={0.24} className="flex flex-col justify-center">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <BarChart3 size={20} />
          </span>
          <h3 className="mt-4 font-bold text-ink">View Results</h3>
          <p className="mt-0.5 text-sm text-ink-soft">History & insights</p>
        </Bento>
      </div>

      <p className="mt-8 text-center text-xs text-ink-faint">
        Screening signal only — not a medical diagnosis. Consult a professional for evaluation.
      </p>
    </Layout>
  );
}
