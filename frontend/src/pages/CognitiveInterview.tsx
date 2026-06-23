import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, CheckCircle2, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import { Bento, Button, PageHeading, Spinner } from "../components/ui";
import { apiPost } from "../lib/api";
import { isAuthed } from "../lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export default function CognitiveInterview() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendTurn = async (history: Msg[]) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiPost("/api/agent/interview", { history });
      if (data.message)
        setMessages((m) => [...m, { role: "assistant", content: data.message }]);
      if (data.complete) setComplete(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed()) sendTurn([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading || complete) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    sendTurn(next);
  };

  if (!isAuthed()) {
    return (
      <Layout>
        <Bento className="mx-auto max-w-md text-center">
          <Bot className="mx-auto text-brand-500" size={32} />
          <h2 className="mt-3 text-xl font-bold">AI Cognitive Interview</h2>
          <p className="mt-2 text-ink-soft">
            Please <Link to="/login" className="font-semibold text-brand-600">log in</Link> to start a screening session.
          </p>
        </Bento>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeading
        icon={<Bot size={22} />}
        title="AI Cognitive Interview"
        subtitle="A conversational MoCA/MMSE-inspired screening — screening signal only, not a diagnosis."
      />

      <Bento className="mx-auto flex max-w-3xl flex-col p-0">
        <div className="flex flex-col gap-3 overflow-y-auto p-6" style={{ height: "58vh" }}>
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <span className="mr-2 mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Sparkles size={15} />
                  </span>
                )}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand-500 text-white"
                      : "bg-slate-50 text-ink"
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-ink-faint">
              <Spinner /> Interviewer is thinking…
            </div>
          )}
          {error && <div className="text-sm text-rose-600">⚠️ {error}</div>}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-line p-4">
          {complete ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 font-semibold text-emerald-700">
              <CheckCircle2 size={18} /> Screening complete — thank you.
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={input}
                placeholder="Type your answer…"
                disabled={loading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                <Send size={16} /> Send
              </Button>
            </div>
          )}
        </div>
      </Bento>
    </Layout>
  );
}
