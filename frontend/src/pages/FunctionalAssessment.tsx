import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, ListChecks } from "lucide-react";
import Layout from "../components/Layout";
import { Bento, Button, Badge, ScoreRing, PageHeading } from "../components/ui";

export default function FunctionalAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);

  const questions = [
    "Feeding – Can you eat independently?",
    "Dressing – Can you choose and wear clothes?",
    "Bathing – Can you bathe without help?",
    "Toileting – Can you use toilet properly?",
    "Grooming – Brushing, combing etc",
    "Mobility – Walking / moving around",
    "Managing finances – Handling money",
    "Medication – Taking medicines on time",
    "Shopping – Buying items independently",
    "Cooking – Preparing meals",
  ];

  const options = [
    { label: "Independent", value: 0 },
    { label: "Needs Assistance", value: 1 },
    { label: "Dependent", value: 2 },
  ];

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    setFinished(true);

    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);

    const percentage = Math.round((totalScore / (questions.length * 2)) * 100);

    await fetch("/api/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        score: percentage,
        total: 100,
        type: "functional",
      }),
    });
  };

  const getLevel = (score: number) => {
    if (score >= 70) return "High Functional Impairment";
    if (score >= 40) return "Moderate Impairment";
    return "Low / Normal Function";
  };

  const getTone = (score: number): "red" | "amber" | "green" => {
    if (score >= 70) return "red";
    if (score >= 40) return "amber";
    return "green";
  };

  const currentQ = questions[step];

  const finalScore = Math.round(
    (Object.values(answers).reduce((a, b) => a + b, 0) /
      (questions.length * 2)) *
      100
  );

  return (
    <Layout>
      <PageHeading
        icon={<ClipboardList size={22} />}
        title="Functional Assessment"
        subtitle="Rate everyday activities to estimate functional impairment."
      />

      <div className="mx-auto max-w-2xl">
        {!finished ? (
          <Bento className="rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <span className="label">
                Question {step + 1} / {questions.length}
              </span>
              <Badge tone="brand">
                <ListChecks size={14} />
                Functional
              </Badge>
            </div>

            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-50">
              <motion.div
                className="h-full rounded-full bg-brand-500"
                initial={false}
                animate={{
                  width: `${((step + 1) / questions.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <p className="mb-6 mt-6 text-lg font-semibold text-ink">
              {currentQ}
            </p>

            <div className="flex flex-col gap-3">
              {options.map((opt, i) => {
                const selected = answers[step] === opt.value;
                return (
                  <Button
                    key={i}
                    variant={selected ? "primary" : "outline"}
                    className="justify-start"
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [step]: opt.value,
                      })
                    }
                  >
                    {opt.label}
                  </Button>
                );
              })}
            </div>

            <div className="mt-7 flex justify-end">
              <Button onClick={handleNext} disabled={answers[step] === undefined}>
                {step === questions.length - 1 ? "Submit" : "Next"}
              </Button>
            </div>
          </Bento>
        ) : (
          <Bento className="rounded-3xl text-center">
            <h3 className="text-xl font-bold text-ink">Assessment Complete</h3>

            <div className="my-6 flex justify-center">
              <ScoreRing value={finalScore} label="/ 100" />
            </div>

            <div className="mb-7 flex justify-center">
              <Badge tone={getTone(finalScore)}>{getLevel(finalScore)}</Badge>
            </div>

            <Button onClick={() => (window.location.href = "/results")}>
              View Results
            </Button>
          </Bento>
        )}
      </div>
    </Layout>
  );
}
