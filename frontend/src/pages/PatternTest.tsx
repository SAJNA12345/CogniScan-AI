import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Puzzle, Check } from "lucide-react";
import Layout from "../components/Layout";
import { Bento, Button, Badge, ScoreRing, PageHeading } from "../components/ui";

export default function PatternTest() {
  const questionBank = [
    {
      question: "What comes next: 2, 4, 8, 16, ?",
      options: ["18", "24", "32", "20"],
      answer: "32",
    },
    {
      question: "What comes next: 3, 6, 9, 12, ?",
      options: ["14", "15", "16", "18"],
      answer: "15",
    },
    {
      question: "What comes next: 1, 1, 2, 3, 5, ?",
      options: ["6", "7", "8", "9"],
      answer: "8",
    },
    {
      question: "What comes next: 10, 20, 40, 80, ?",
      options: ["120", "140", "160", "180"],
      answer: "160",
    },
    {
      question: "Find the pattern: A, C, E, G, ?",
      options: ["H", "I", "J", "K"],
      answer: "I",
    },
    {
      question: "What comes next: 5, 7, 11, 19, ?",
      options: ["29", "31", "35", "39"],
      answer: "35",
    },
    {
      question: "What comes next: 100, 90, 80, 70, ?",
      options: ["65", "60", "50", "55"],
      answer: "60",
    },
  ];

  const getRandomQuestions = () => {
    return [...questionBank].sort(() => 0.5 - Math.random()).slice(0, 5);
  };

  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setQuestions(getRandomQuestions());
  }, []);

  const handleNext = async () => {
    if (selected === questions[current].answer) {
      setScore((prev) => prev + 1);
    }

    setSelected("");

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);

      // 🔥 SAVE RESULT

      const percentage = Math.round((score / questions.length) * 100);
      await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

        body: JSON.stringify({
          score: percentage, // ✅ save as percentage
          total: 100,
          type: "pattern",
        }),
      });

      setTimeout(() => {
        window.location.href = "/results";
      }, 1500);
    }
  };

  const finalPercentage = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

  return (
    <Layout>
      <PageHeading
        icon={<Puzzle size={22} />}
        title="Pattern Test"
        subtitle="Spot the sequence and pick what comes next."
      />

      {!finished ? (
        <Bento className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <Badge tone="brand">
              Question {current + 1} of {questions.length || 5}
            </Badge>
            <span className="label">Pattern Recognition</span>
          </div>

          <motion.p
            key={current}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 text-lg font-semibold text-ink"
          >
            {questions[current]?.question}
          </motion.p>

          <div className="flex flex-col gap-3">
            {questions[current]?.options.map((opt: string, i: number) => {
              const active = selected === opt;
              return (
                <Button
                  key={i}
                  variant={active ? "primary" : "outline"}
                  className="w-full justify-between"
                  onClick={() => setSelected(opt)}
                >
                  <span>{opt}</span>
                  {active && <Check size={16} />}
                </Button>
              );
            })}
          </div>

          <Button
            variant="primary"
            className="mt-8 w-full"
            onClick={handleNext}
            disabled={!selected}
          >
            {current === questions.length - 1 ? "Submit" : "Next"}
          </Button>
        </Bento>
      ) : (
        <Bento className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex justify-center">
            <Badge tone="green">Test Completed</Badge>
          </div>
          <h3 className="mb-6 text-xl font-extrabold text-ink">
            Great work! 🎉
          </h3>
          <div className="flex justify-center">
            <ScoreRing value={finalPercentage} label="/ 100" />
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            Score: {score} / {questions.length}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            Redirecting to your results…
          </p>
        </Bento>
      )}
    </Layout>
  );
}
