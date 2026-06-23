import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

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
    return [...questionBank]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
  };

  const [questions, setQuestions] = useState([]);
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
          score: percentage,   // ✅ save as percentage
          total: 100,
          type: "pattern",
        }),
        
      });

      setTimeout(() => {
        window.location.href = "/results";
      }, 1500);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.card}>
          <h2>🧩 Pattern Recognition Test</h2>

          {!finished ? (
            <>
              <p style={styles.question}>
                Q{current + 1}. {questions[current]?.question}
              </p>

              <div style={styles.options}>
                {questions[current]?.options.map((opt, i) => (
                  <button
                    key={i}
                    style={{
                      ...styles.optionBtn,
                      background:
                        selected === opt ? "#1976d2" : "#eee",
                      color:
                        selected === opt ? "white" : "black",
                    }}
                    onClick={() => setSelected(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                style={styles.nextBtn}
                onClick={handleNext}
                disabled={!selected}
              >
                {current === questions.length - 1
                  ? "Submit"
                  : "Next"}
              </button>
            </>
          ) : (
            <div style={styles.result}>
              <h3>🎉 Test Completed</h3>
              <p>
                Score: {score} / {questions.length}
              </p>
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
    background: "linear-gradient(135deg, #e3f2fd, #ede7f6)",
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    width: "420px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
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
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  nextBtn: {
    marginTop: "20px",
    padding: "10px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
  },

  result: {
    fontSize: "18px",
  },
};