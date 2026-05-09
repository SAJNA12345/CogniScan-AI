import { useState } from "react";
import Navbar from "../components/Navbar";

export default function RiskFactors() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
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

  const finishTest = async (finalScore) => {
    setFinished(true);

    const percentage = Math.min(Math.round((finalScore / 16) * 100), 100);

    await fetch("http://localhost:5000/api/results", {
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

  const getLevel = (score) => {
    if (score < 30) return "🟢 Low Risk";
    if (score < 60) return "🟡 Moderate Risk";
    return "🔴 High Risk";
  };

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.card}>
          <h2>⚠️ Risk Factor Assessment</h2>

          {!finished ? (
            <>
              <p style={styles.progress}>
                Question {step + 1} / {questions.length}
              </p>

              <p style={styles.question}>
                {questions[step].q}
              </p>

              <div style={styles.options}>
                {questions[step].options.map((opt, i) => (
                  <button
                    key={i}
                    style={{
                      ...styles.optionBtn,
                      background:
                      answers[step] === i ? "#1976d2" : "#eee",
                    color:
                      answers[step] === i ? "white" : "black",
                    }}
                    onClick={() =>
                      setAnswers({ ...answers, [step]: i })
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                style={styles.nextBtn}
                onClick={handleNext}
                disabled={answers[step] === undefined}
              >
                {step === questions.length - 1
                  ? "Submit"
                  : "Next"}
              </button>
            </>
          ) : (
            <div style={styles.result}>
              <h3>Assessment Complete</h3>

              <p style={styles.score}>
                {Math.min(Math.round((score / 16) * 100), 100)} / 100
              </p>

              <p style={styles.level}>
              {getLevel(percentage)}
            </p>

            <p style={styles.note}>
              {percentage < 30 && "Your risk is low. Maintain a healthy lifestyle."}
              {percentage >= 30 && percentage < 60 && "Moderate risk. Consider improving lifestyle factors."}
              {percentage >= 60 && "High risk detected. Medical consultation is recommended."}
            </p>

              <button
                style={styles.nextBtn}
                onClick={() =>
                  (window.location.href = "/results")
                }
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
    background: "linear-gradient(to right, #e3f2fd, #bbdefb)", // 🔵 blue gradient
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
    color: "#333",
  },

  options: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  optionBtn: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "0.2s",
  },

  nextBtn: {
    marginTop: "20px",
    padding: "12px",
    background: "linear-gradient(to right, #1976d2, #42a5f5)", // 🔵 primary blue
    color: "white",
    border: "none",
    borderRadius: "10px",
    width: "100%",
    cursor: "pointer",
    fontWeight: "500",
  },

  progress: {
    fontSize: "13px",
    color: "#666",
  },

  score: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#1976d2", // 🔵 blue score
  },

  level: {
    marginTop: "5px",
    fontWeight: "500",
  },
};