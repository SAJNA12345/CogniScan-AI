import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, HeartPulse } from "lucide-react";
import Layout from "../components/Layout";
import { Bento, Button, Badge, ScoreRing, PageHeading } from "../components/ui";

export default function RiskFactors() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = [
    {
      q: "What is your age group?",
      options: ["Below 50", "50 - 70", "Above 70"],
      risk: ["low", "medium", "high"],
    },
    {
      q: "Do you have a family history of dementia?",
      options: ["No", "Not sure", "Yes"],
      risk: ["low", "medium", "high"],
    },
    {
      q: "Gender",
      options: ["Male", "Female"],
      risk: ["low", "medium"],
    },
    {
      q: "Do you smoke?",
      options: ["No", "Occasionally", "Regularly"],
      risk: ["low", "medium", "high"],
    },
    {
      q: "History of head injury or concussion?",
      options: ["No", "Yes"],
      risk: ["low", "high"],
    },
    {
      q: "Have you had a stroke before?",
      options: ["No", "Yes"],
      risk: ["low", "high"],
    },
    {
      q: "Do you have hypertension (high BP)?",
      options: ["No", "Yes"],
      risk: ["low", "high"],
    },
    {
      q: "Do you have diabetes?",
      options: ["No", "Yes"],
      risk: ["low", "high"],
    },
  ];

  const handleNext = () => {
    const selected = answers[step];
    let newScore = score;

    if (selected !== undefined) {
      const riskLevel = questions[step].risk[selected];

      if (riskLevel === "medium") newScore += 1;
      if (riskLevel === "high") newScore += 2;
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

    const percentage = Math.min(Math.round((finalScore / 16) * 100), 100);

    await fetch("/api/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        score: percentage,
        total: 100,
        type: "risk",
      }),
    });
  };

  const percentage = Math.min(Math.round((score / 16) * 100), 100);

  const getLevel = (s: number) => {
    if (s < 30) return "Low Risk";
    if (s < 60) return "Moderate Risk";
    return "High Risk";
  };

  const levelTone =
    percentage < 30 ? "green" : percentage < 60 ? "amber" : "red";

  return (
    <Layout>
      <PageHeading
        icon={<AlertTriangle size={22} />}
        title="Risk Factors"
        subtitle="Answer a few questions to estimate your dementia risk profile."
      />

      <div className="mx-auto max-w-xl">
        {!finished ? (
          <Bento className="rounded-3xl" key={step} delay={0.05}>
            <div className="mb-4 flex items-center justify-between">
              <span className="label">Risk Assessment</span>
              <Badge tone="brand">
                Question {step + 1} / {questions.length}
              </Badge>
            </div>

            <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-brand-50">
              <motion.div
                className="h-full rounded-full bg-brand-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${((step + 1) / questions.length) * 100}%`,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <h2 className="mb-5 text-lg font-bold text-ink">
              {questions[step].q}
            </h2>

            <div className="flex flex-col gap-3">
              {questions[step].options.map((opt, i) => {
                const active = answers[step] === i;
                return (
                  <Button
                    key={i}
                    variant={active ? "primary" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setAnswers({ ...answers, [step]: i })}
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>

            <div className="mt-6">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleNext}
                disabled={answers[step] === undefined}
              >
                {step === questions.length - 1 ? "Submit" : "Next"}
              </Button>
            </div>
          </Bento>
        ) : (
          <Bento className="rounded-3xl text-center" delay={0.05}>
            <div className="mb-4 flex flex-col items-center gap-2">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <HeartPulse size={24} />
              </span>
              <h2 className="text-xl font-extrabold text-ink">
                Assessment Complete
              </h2>
            </div>

            <div className="my-6 flex justify-center">
              <ScoreRing value={percentage} label="/ 100" />
            </div>

            <div className="mb-4 flex justify-center">
              <Badge tone={levelTone}>{getLevel(percentage)}</Badge>
            </div>

            <p className="mx-auto mb-6 max-w-sm text-sm text-ink-soft">
              {percentage < 30 &&
                "Your risk is low. Maintain a healthy lifestyle."}
              {percentage >= 30 &&
                percentage < 60 &&
                "Moderate risk. Consider improving lifestyle factors."}
              {percentage >= 60 &&
                "High risk detected. Medical consultation is recommended."}
            </p>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => (window.location.href = "/results")}
            >
              View Results
            </Button>
          </Bento>
        )}
      </div>
    </Layout>
  );
}
