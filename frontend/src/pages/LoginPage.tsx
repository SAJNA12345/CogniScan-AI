import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, LogIn, Loader2 } from "lucide-react";
import { Field, Button } from "../components/ui";
import { apiPost } from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiPost("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      navigate("/home");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your screening journey.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Field label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
          Log in
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-soft">
        No account?{" "}
        <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <Brain size={20} />
          </span>
          <span className="text-xl font-extrabold">CogniScan</span>
        </Link>
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold leading-tight"
          >
            Intelligent dementia early screening.
          </motion.h2>
          <p className="mt-4 max-w-md text-brand-50/90">
            Cognitive assessments, AI interviews, and speech biomarkers — in one calm, professional workspace.
          </p>
        </div>
        <p className="text-sm text-brand-50/70">For educational & research use only.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-bg p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-3xl border border-line bg-surface p-8 shadow-bento"
        >
          <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-ink-soft">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
