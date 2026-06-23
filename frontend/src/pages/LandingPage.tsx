import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Bot, Mic, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { Bento } from "../components/ui";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg bg-grid-fade">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
            <Brain size={18} />
          </span>
          <span className="text-lg font-extrabold">
            Cogni<span className="text-brand-600">Scan</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink">Login</Link>
          <Link to="/signup" className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Get started</Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <ShieldCheck size={13} /> Early cognitive health screening
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl">
            Understand cognitive health,{" "}
            <span className="text-brand-600">early and clearly.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
            CogniScan combines interactive assessments, conversational AI interviews, and
            speech biomarkers into one calm, professional screening experience.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-sm shadow-brand-500/30 hover:bg-brand-600">
              Start screening <ArrowRight size={18} />
            </Link>
            <Link to="/home" className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-6 py-3 font-semibold text-ink-soft hover:bg-slate-50">
              Explore dashboard
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-5 px-6 pb-20 sm:grid-cols-3">
        {[
          { icon: Bot, title: "AI Interview", desc: "An adaptive, MoCA/MMSE-inspired conversation that scores cognition in real time." },
          { icon: Mic, title: "Voice Biomarkers", desc: "Acoustic & linguistic speech markers analysed for early decline signals." },
          { icon: AlertTriangle, title: "Risk Insights", desc: "Modifiable & non-modifiable dementia risk factors, clearly explained." },
        ].map((f, i) => (
          <Bento key={f.title} delay={i * 0.08}>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <f.icon size={20} />
            </span>
            <h3 className="mt-4 font-bold text-ink">{f.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{f.desc}</p>
          </Bento>
        ))}
      </section>
    </div>
  );
}
