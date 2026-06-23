import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, ArrowRight, Check, Eye } from "lucide-react";
import Layout from "../components/Layout";
import { Bento, Button, Badge, ScoreRing, Field, PageHeading } from "../components/ui";

export default function CognitiveTest() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // 🧠 MMSE STRUCTURE (MIXED QUESTIONS)
  const questions = [
    // 🔹 ORIENTATION (MCQ)
    {
      type: "mcq",
      q: "What year is this?",
      options: ["2023", "2024", "2025", "2026"],
      answer: "2026",
    },
    {
      type: "mcq",
      q: "What month is this?",
      options: ["January", "March", "May", "December"],
      answer: "May",
    },
    {
      type: "mcq",
      q: "Which country are you in?",
      options: ["USA", "India", "UK", "Canada"],
      answer: "India",
    },

    // 🔹 MEMORY (INFO + INPUT)
    {
      type: "info",
      q: "Memorize these words: APPLE, CAR, TABLE",
    },
    {
      type: "input",
      q: "Repeat word 1",
      answer: "apple",
    },
    {
      type: "input",
      q: "Repeat word 2",
      answer: "car",
    },
    {
      type: "input",
      q: "Repeat word 3",
      answer: "table",
    },

    // 🔹 ATTENTION (MCQ)
    {
      type: "mcq",
      q: "100 - 7 = ?",
      options: ["91", "92", "93", "94"],
      answer: "93",
    },
    {
      type: "mcq",
      q: "93 - 7 = ?",
      options: ["84", "85", "86", "87"],
      answer: "86",
    },

    // 🔹 LANGUAGE
    {
      type: "input",
      q: "Spell WORLD backwards",
      answer: "dlrow",
    },
    {
      type: "mcq",
      q: "Identify object: ✏️",
      options: ["Pen", "Pencil", "Eraser", "Marker"],
      answer: "Pencil",
    },
    {
      type: "input",
      q: "Type this sentence exactly: I enjoy learning new things",
      answer: "i enjoy learning new things",
    },

    // 🔹 RECALL
    {
      type: "input",
      q: "Recall word 1",
      answer: "apple",
    },
    {
      type: "input",
      q: "Recall word 2",
      answer: "car",
    },
    {
      type: "input",
      q: "Recall word 3",
      answer: "table",
    },

    // 🔹 WRITING
    {
      type: "input",
      q: "Write a meaningful sentence",
      customCheck: true, // special validation
    },
  ];

  const currentQ: any = questions[step];

  const normalize = (text?: string) => text?.toLowerCase().trim();

  const handleNext = () => {
    let newScore = score;

    if (currentQ.type !== "info") {
      const userAns = answers[step];

      if (currentQ.customCheck) {
        // sentence validation (basic)
        if (userAns && userAns.split(" ").length > 2) {
          newScore += 1;
        }
      } else {
        if (normalize(userAns) === normalize(currentQ.answer)) {
          newScore += 1;
        }
      }
    }

    setScore(newScore);

    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      finishTest(newScore);
    }
  };

  const finishTest = async (finalScore: number) => {
    setFinished(true);

    const percentage = Math.round(
      (finalScore / (questions.length - 1)) * 100
    ); // exclude info question

    await fetch("/api/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        score: percentage,
        total: 100,
        type: "cognitive",
      }),
    });
  };

  const getLevel = (score: number) => {
    if (score >= 80) return { label: "Normal", tone: "green" as const };
    if (score >= 50) return { label: "Mild Impairment", tone: "amber" as const };
    return { label: "Needs Attention", tone: "red" as const };
  };

  const finalPercentage = Math.round(
    (score / (questions.length - 1)) * 100
  );

  return (
    <Layout>
      <PageHeading
        icon={<Brain size={22} />}
        title="Cognitive Test"
        subtitle="A short MMSE-style assessment of orientation, memory, attention and recall."
      />

      {!finished ? (
        <Bento className="mx-auto max-w-2xl" delay={0.05}>
          <div className="mb-5 flex items-center justify-between">
            <span className="label">
              Question {step + 1} / {questions.length}
            </span>
            <Badge tone="brand">{currentQ.type === "mcq" ? "Multiple choice" : currentQ.type === "input" ? "Type answer" : "Memorize"}</Badge>
          </div>

          {/* progress bar */}
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-brand-50">
            <motion.div
              className="h-full rounded-full bg-brand-500"
              initial={false}
              animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          <h2 className="mb-6 text-xl font-bold text-ink">{currentQ.q}</h2>

          {/* 🔹 INFO */}
          {currentQ.type === "info" && (
            <div className="flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
              <Eye size={18} />
              Memorize carefully — you will be asked to recall these.
            </div>
          )}

          {/* 🔹 INPUT */}
          {currentQ.type === "input" && (
            <Field
              type="text"
              placeholder="Type your answer"
              value={answers[step] || ""}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [step]: e.target.value,
                })
              }
            />
          )}

          {/* 🔹 MCQ */}
          {currentQ.type === "mcq" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {currentQ.options.map((opt: string, i: number) => {
                const active = answers[step] === opt;
                return (
                  <button
                    key={i}
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [step]: opt,
                      })
                    }
                    className={
                      "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition " +
                      (active
                        ? "border-brand-500 bg-brand-500 text-white shadow-sm shadow-brand-500/30"
                        : "border-line bg-white text-ink-soft hover:border-brand-300 hover:bg-brand-50")
                    }
                  >
                    {opt}
                    {active && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={currentQ.type !== "info" && !answers[step]}
            >
              {step === questions.length - 1 ? "Submit" : "Next"}
              <ArrowRight size={16} />
            </Button>
          </div>
        </Bento>
      ) : (
        <Bento className="mx-auto max-w-2xl text-center" delay={0.05}>
          <Badge tone="green" className="mb-4">
            <Check size={14} /> Test Completed
          </Badge>

          <div className="my-6 flex justify-center">
            <ScoreRing value={finalPercentage} label="/ 100" />
          </div>

          <p className="mb-1 text-sm font-medium text-ink-soft">Cognitive Score</p>

          <div className="mb-8 flex justify-center">
            <Badge tone={getLevel(finalPercentage).tone}>
              {getLevel(finalPercentage).label}
            </Badge>
          </div>

          <Button
            variant="primary"
            onClick={() => (window.location.href = "/results")}
          >
            View Results
            <ArrowRight size={16} />
          </Button>
        </Bento>
      )}
    </Layout>
  );
}
