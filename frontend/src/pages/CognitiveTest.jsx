// import { useState, useEffect } from "react";
// import Navbar from "../components/Navbar";

// export default function CognitiveTest() {
//   const questionBank = [
//     {
//       type: "memory",
//       word: "TREE",
//       question: "What was the word shown earlier?",
//       options: ["Car", "Tree", "Dog", "Book"],
//       answer: "Tree",
//     },
//     {
//       type: "math",
//       question: "What is 15 × 3?",
//       options: ["30", "45", "50", "60"],
//       answer: "45",
//     },
//     {
//       type: "math",
//       question: "What comes next: 5, 10, 20, 40, ?",
//       options: ["60", "70", "80", "90"],
//       answer: "80",
//     },
//     {
//       type: "logic",
//       question: "Find the odd one out",
//       options: ["Apple", "Banana", "Car", "Mango"],
//       answer: "Car",
//     },
//     {
//       type: "attention",
//       question: "Count number of 'A' in: BANANA",
//       options: ["2", "3", "4", "5"],
//       answer: "3",
//     },
//     {
//       type: "hard",
//       question: "If 2 = 6, 3 = 12, 4 = 20, then 5 = ?",
//       options: ["25", "30", "35", "40"],
//       answer: "30",
//     },
//     {
//       type: "logic",
//       question: "Rearrange letters: LPAEP",
//       options: ["APPLE", "PEPAL", "LEAPP", "PALPE"],
//       answer: "APPLE",
//     },
//   ];

//   // 🔀 Random questions
//   const getRandomQuestions = () => {
//     const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
//     return shuffled.slice(0, 5);
//   };

//   const [questions, setQuestions] = useState([]);
//   const [current, setCurrent] = useState(0);
//   const [selected, setSelected] = useState("");
//   const [score, setScore] = useState(0);
//   const [finished, setFinished] = useState(false);

//   // 🧠 Memory control
//   const [showWord, setShowWord] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(20);

//   // Load questions
//   useEffect(() => {
//     setQuestions(getRandomQuestions());
//   }, []);

//   // Handle memory timer
//   useEffect(() => {
//     if (questions.length === 0) return;

//     const currentQ = questions[current];

//     if (currentQ?.type === "memory") {
//       setShowWord(true);
//       setTimeLeft(10);

//       const interval = setInterval(() => {
//         setTimeLeft((prev) => prev - 1);
//       }, 1000);

//       const timer = setTimeout(() => {
//         setShowWord(false);
//         clearInterval(interval);
//       }, 10000);

//       return () => {
//         clearTimeout(timer);
//         clearInterval(interval);
//       };
//     } else {
//       setShowWord(false);
//     }
//   }, [current, questions]);

//     const handleNext = async () => {
//     let updatedScore = score;

//     // ✅ FIX: calculate score correctly
//     if (selected === questions[current].answer) {
//       updatedScore = score + 1;
//       setScore(updatedScore);
//     }

//     setSelected("");

//     if (current + 1 < questions.length) {
//       setCurrent(current + 1);
//     } else {
//       setFinished(true);

//       // 🎯 FINAL RESULT OBJECT
//       const finalResult = {
//         score: updatedScore * 20, // convert to /100 scale
//         type: "cognitive", // ✅ VERY IMPORTANT
//       };

//       console.log("Sending:", finalResult);

//       // 🔥 SAVE TO DB
//       await fetch("/api/results", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify(finalResult),
//       });

//       window.location.href = "/results";
//     }
//   };

//   return (
//     <div>
//       <Navbar />

//       <div style={styles.container}>
//         <div style={styles.card}>
//           <h2>🧠 Cognitive Test</h2>

//           {!finished ? (
//             <>
//               {/* 🧠 MEMORY DISPLAY */}
//               {questions[current]?.type === "memory" && showWord ? (
//                 <div>
//                   <h2 style={{ color: "#4A90E2" }}>
//                     Memorize this word:
//                   </h2>
//                   <h1 style={styles.word}>
//                     {questions[current].word}
//                   </h1>
//                   <p>⏳ Time left: {timeLeft}s</p>
//                 </div>
//               ) : (
//                 <>
//                   <p style={styles.question}>
//                     Q{current + 1}. {questions[current]?.question}
//                   </p>

//                   <div style={styles.options}>
//                     {questions[current]?.options.map((opt, i) => (
//                       <button
//                         key={i}
//                         style={{
//                           ...styles.optionBtn,
//                           background:
//                             selected === opt ? "#4A90E2" : "#eee",
//                           color:
//                             selected === opt ? "white" : "black",
//                         }}
//                         onClick={() => setSelected(opt)}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                 </>
//               )}

//               <button
//                 style={styles.nextBtn}
//                 onClick={handleNext}
//                 disabled={
//                   !selected ||
//                   (questions[current]?.type === "memory" && showWord)
//                 }
//               >
//                 {current === questions.length - 1
//                   ? "Submit"
//                   : "Next"}
//               </button>
//             </>
//           ) : (
//                       <div style={styles.result}>
//               <h3>🎉 Test Completed</h3>

//               <div style={styles.scoreCircle}>
//                 {score * 20}
//               </div>

//               <p style={{ marginTop: "10px" }}>
//                 Cognitive Score
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     height: "90vh",
//     background: "#f4f6f9",
//   },
//   card: {
//     background: "white",
//     padding: "30px",
//     borderRadius: "12px",
//     width: "420px",
//     boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
//     textAlign: "center",
//   },
//   question: {
//     fontSize: "18px",
//     margin: "20px 0",
//   },
//   scoreCircle: {
//   width: "80px",
//   height: "80px",
//   borderRadius: "50%",
//   background: "linear-gradient(135deg, #7b1fa2, #ba68c8)",
//   color: "white",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   fontSize: "24px",
//   margin: "auto",
//   },
//   word: {
//     fontSize: "36px",
//     fontWeight: "bold",
//     margin: "10px 0",
//   },
//   options: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "10px",
//   },
//   optionBtn: {
//     padding: "10px",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//   },
//   nextBtn: {
//     marginTop: "20px",
//     padding: "10px",
//     background: "#4A90E2",
//     color: "white",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//     width: "100%",
//   },
//   result: {
//     fontSize: "18px",
//   },
// };
import { useState } from "react";
import Navbar from "../components/Navbar";

export default function CognitiveTest() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
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

  const currentQ = questions[step];

  const normalize = (text) =>
    text?.toLowerCase().trim();

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
        if (
          normalize(userAns) === normalize(currentQ.answer)
        ) {
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

  const finishTest = async (finalScore) => {
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

  const getLevel = (score) => {
    if (score >= 80) return "🟢 Normal";
    if (score >= 50) return "🟡 Mild Impairment";
    return "🔴 Needs Attention";
  };

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.card}>
          <h2>🧠 MMSE Cognitive Test</h2>

          {!finished ? (
            <>
              <p style={styles.progress}>
                Question {step + 1} / {questions.length}
              </p>

              <p style={styles.question}>{currentQ.q}</p>

              {/* 🔹 INFO */}
              {currentQ.type === "info" && (
                <p style={styles.info}>Memorize carefully</p>
              )}

              {/* 🔹 INPUT */}
              {currentQ.type === "input" && (
                <input
                  type="text"
                  placeholder="Type your answer"
                  value={answers[step] || ""}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [step]: e.target.value,
                    })
                  }
                  style={styles.input}
                />
              )}

              {/* 🔹 MCQ */}
              {currentQ.type === "mcq" && (
                <div style={styles.options}>
                  {currentQ.options.map((opt, i) => (
                    <button
                      key={i}
                      style={{
                        ...styles.optionBtn,
                        background:
                          answers[step] === opt
                            ? "#4facfe"
                            : "#eee",
                        color:
                          answers[step] === opt
                            ? "white"
                            : "black",
                      }}
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          [step]: opt,
                        })
                      }
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              <button
                style={styles.nextBtn}
                onClick={handleNext}
                disabled={
                  currentQ.type !== "info" &&
                  !answers[step]
                }
              >
                {step === questions.length - 1
                  ? "Submit"
                  : "Next"}
              </button>
            </>
          ) : (
            <div style={styles.result}>
              <h3>🎉 Test Completed</h3>

              <p style={styles.finalScore}>
                {Math.round(
                  (score / (questions.length - 1)) * 100
                )}{" "}
                / 100
              </p>

              <p style={styles.level}>
                {getLevel(
                  Math.round(
                    (score / (questions.length - 1)) * 100
                  )
                )}
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
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
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
  info: {
    color: "#4A90E2",
    fontWeight: "500",
  },
  finalScore: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#4facfe",
  },
  level: {
    marginTop: "5px",
    fontWeight: "500",
  },
};