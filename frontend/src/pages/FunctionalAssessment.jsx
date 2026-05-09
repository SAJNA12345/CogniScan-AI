import { useState } from "react";
import Navbar from "../components/Navbar";

export default function FunctionalAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
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

    await fetch("http://localhost:5000/api/results", {
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

  const getLevel = (score) => {
    if (score >= 70) return "🔴 High Functional Impairment";
    if (score >= 40) return "🟡 Moderate Impairment";
    return "🟢 Low / Normal Function";
  };

  const currentQ = questions[step];

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.card}>
          <h2>🧾 Functional Assessment</h2>

          {!finished ? (
            <>
              <p style={styles.progress}>
                Question {step + 1} / {questions.length}
              </p>

              <p style={styles.question}>{currentQ}</p>

              <div style={styles.options}>
                {options.map((opt, i) => (
                  <button
                    key={i}
                    style={{
                      ...styles.optionBtn,
                      background:
                        answers[step] === opt.value
                          ? "#1976d2"
                          : "#eef3f9",
                      color:
                        answers[step] === opt.value
                          ? "white"
                          : "#333",
                    }}
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [step]: opt.value,
                      })
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                style={styles.nextBtn}
                onClick={handleNext}
                disabled={answers[step] === undefined}
              >
                {step === questions.length - 1 ? "Submit" : "Next"}
              </button>
            </>
          ) : (
            <div style={styles.result}>
              <h3>Assessment Complete</h3>

              <p style={styles.score}>
                {Math.round(
                  (Object.values(answers).reduce((a, b) => a + b, 0) /
                    (questions.length * 2)) *
                    100
                )}{" "}
                / 100
              </p>

              <p style={styles.level}>
                {getLevel(
                  Math.round(
                    (Object.values(answers).reduce((a, b) => a + b, 0) /
                      (questions.length * 2)) *
                      100
                  )
                )}
              </p>

              <button
                style={styles.nextBtn}
                onClick={() => (window.location.href = "/results")}
              >
                View Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "90vh",
    background: "linear-gradient(135deg, #e3f2fd, #90caf9)",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    width: "450px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  question: {
    fontSize: "18px",
    margin: "20px 0",
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  optionBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
  },
  nextBtn: {
    marginTop: "20px",
    padding: "12px",
    background: "linear-gradient(to right, #1976d2, #42a5f5)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    width: "100%",
    cursor: "pointer",
  },
  progress: {
    fontSize: "13px",
    color: "#777",
  },
  score: {
    fontSize: "28px",
    color: "#1976d2",
    fontWeight: "600",
  },
  level: {
    marginTop: "8px",
    fontWeight: "500",
  },
};