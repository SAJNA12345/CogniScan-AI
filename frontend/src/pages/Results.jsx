// import { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// export default function Results() {
//   const [results, setResults] = useState([]);
//   const [filter, setFilter] = useState("all");

//   useEffect(() => {
//     fetchResults();
//   }, []);

//   const fetchResults = async () => {
//     try {
//       const res = await fetch("/api/results", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       const data = await res.json();
//       setResults(Array.isArray(data) ? data.reverse() : []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // 🎯 Normalize score
//   const normalizeScore = (r) =>
//     Math.round((r.score / (r.total || 100)) * 100);

//   // 🎨 COLOR BASED ON TYPE
//   const getColor = (type, score) => {
//     if (type === "risk") {
//       if (score < 30) return "#2e7d32";
//       if (score < 60) return "#f9a825";
//       return "#c62828";
//     }

//     if (score >= 75) return "#2e7d32";
//     if (score >= 40) return "#f9a825";
//     return "#c62828";
//   };

//   // 🏷️ LABEL BASED ON TYPE
//   const getStatus = (type, score) => {
//     if (type === "risk") {
//       if (score < 30) return "🟢 Low Risk";
//       if (score < 60) return "🟡 Moderate Risk";
//       return "🔴 High Risk";
//     }

//     if (score >= 75) return "Excellent Performance";
//     if (score >= 40) return "Good Performance";
//     return "Needs Improvement";
//   };

//   // 🧠 TYPE LABEL
//   const getTypeLabel = (type) => {
//     const t =
//       typeof type === "string"
//         ? type.toLowerCase()
//         : type?.name?.toLowerCase();

//     if (t === "cognitive") return "🧠 Cognitive";
//     if (t === "speech") return "🎤 Speech";
//     if (t === "pattern") return "🧩 Pattern";
//     if (t === "risk") return "⚠️ Risk";

//     return "Unknown";
//   };

//   // 🔘 FILTER
//   const filtered =
//     filter === "all"
//       ? results
//       : results.filter((r) => r.type === filter);

//   // 📊 CHART
//   const chartData = filtered.map((r, i) => ({
//     name: `${getTypeLabel(r.type)} ${i + 1}`,
//     score: normalizeScore(r),
//   }));

//   return (
//     <div>
//       <Navbar />

//       <div style={styles.container}>
//         <h2 style={styles.heading}>📊 Your Results Dashboard</h2>

//         {/* 🔘 FILTER BUTTONS */}
//         <div style={styles.filters}>
//           {["all", "cognitive", "pattern", "risk"].map((f) => (
//             <button
//               key={f}
//               onClick={() => setFilter(f)}
//               style={{
//                 ...styles.filterBtn,
//                 background: filter === f ? "#1976d2" : "white",
//                 color: filter === f ? "white" : "#333",
//               }}
//             >
//               {f.toUpperCase()}
//             </button>
//           ))}
//         </div>

//         {/* 📊 CARDS */}
//         <div style={styles.grid}>
//           {filtered.map((r, index) => {
//             const score = normalizeScore(r);
//             const type = r.type?.toLowerCase();

//             return (
//               <div key={index} style={styles.card}>
//                 <h3>{getTypeLabel(type)}</h3>

//                 <p
//                   style={{
//                     ...styles.score,
//                     color: getColor(type, score),
//                   }}
//                 >
//                   {score} / 100
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "13px",
//                     marginTop: "6px",
//                     fontWeight: "500",
//                     color: getColor(type, score),
//                   }}
//                 >
//                   {getStatus(type, score)}
//                 </p>

//                 {/* PROGRESS BAR */}
//                 <div style={styles.progressBar}>
//                   <div
//                     style={{
//                       ...styles.progressFill,
//                       width: `${score}%`,
//                       background: getColor(type, score),
//                     }}
//                   ></div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* 📊 CHART */}
//         <div style={styles.chartBox}>
//           <h3 style={{ color: "#1976d2" }}>
//             📈 Performance Overview
//           </h3>

//           {chartData.length === 0 ? (
//             <p>No data available</p>
//           ) : (
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={chartData}>
//                 <defs>
//                   <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor="#1976d2" />
//                     <stop offset="100%" stopColor="#64b5f6" />
//                   </linearGradient>
//                 </defs>

//                 <XAxis dataKey="name" stroke="#666" />
//                 <YAxis stroke="#666" />
//                 <Tooltip />

//                 <Bar
//                   dataKey="score"
//                   fill="url(#colorScore)"
//                   radius={[8, 8, 0, 0]}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     padding: "40px 20px",
//     minHeight: "100vh",
//     background: "linear-gradient(to right, #eef2f7, #f9fbfd)",
//   },

//   heading: {
//     textAlign: "center",
//     marginBottom: "20px",
//   },

//   filters: {
//     display: "flex",
//     justifyContent: "center",
//     gap: "10px",
//     marginBottom: "25px",
//   },

//   filterBtn: {
//     padding: "8px 14px",
//     borderRadius: "20px",
//     border: "1px solid #ddd",
//     cursor: "pointer",
//     fontSize: "13px",
//   },

//   grid: {
//     display: "flex",
//     flexWrap: "wrap",
//     gap: "20px",
//     justifyContent: "center",
//   },

//   card: {
//     width: "260px",
//     padding: "20px",
//     borderRadius: "16px",
//     background: "white",
//     boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
//     textAlign: "center",
//   },

//   score: {
//     fontSize: "26px",
//     fontWeight: "600",
//     margin: "10px 0",
//   },

//   progressBar: {
//     height: "10px",
//     background: "#eee",
//     borderRadius: "10px",
//     overflow: "hidden",
//     margin: "10px 0",
//   },

//   progressFill: {
//     height: "100%",
//     transition: "0.3s",
//   },

//   chartBox: {
//     marginTop: "40px",
//     background: "white",
//     padding: "20px",
//     borderRadius: "16px",
//     width: "90%",
//     marginInline: "auto",
//     boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
//   },
// };
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function Results() {
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/results", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setResults(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🎯 Normalize score
  const normalizeScore = (r) =>
    Math.round((r.score / (r.total || 100)) * 100);

  // 🎯 TYPE LABEL
  const getTypeLabel = (type) => {
    const t = typeof type === "string"
      ? type.toLowerCase()
      : type?.name?.toLowerCase();

    if (t === "cognitive") return "🧠 Cognitive";
    if (t === "pattern") return "🧩 Pattern";
    if (t === "risk") return "⚠️ Risk";
    if (t === "functional") return "🧾 Functional";

    return "Unknown";
  };

  // 🎨 COLOR LOGIC (IMPORTANT 🔥)
  const getColor = (score, type) => {
    if (type === "risk" || type === "functional") {
      // ❗ HIGH SCORE = BAD
      if (score >= 70) return "#c62828"; // red
      if (score >= 40) return "#f9a825"; // yellow
      return "#2e7d32"; // green
    } else {
      // ✅ NORMAL TESTS
      if (score >= 75) return "#2e7d32";
      if (score >= 40) return "#f9a825";
      return "#c62828";
    }
  };

  // 🧠 TEXT INTERPRETATION
  const getLabel = (score, type) => {
    if (type === "risk") {
      if (score >= 70) return "🔴 High Risk";
      if (score >= 40) return "🟡 Moderate Risk";
      return "🟢 Low Risk";
    }

    if (type === "functional") {
      if (score >= 70) return "🔴 Severe Impairment";
      if (score >= 40) return "🟡 Moderate Impairment";
      return "🟢 No/Low Impairment";
    }

    // normal tests
    if (score >= 75) return "Excellent";
    if (score >= 40) return "Good";
    return "Needs Improvement";
  };

  // 🎯 FILTER
  const filtered =
    filter === "all"
      ? results
      : results.filter((r) => r.type === filter);

  // 📊 Chart Data
  const chartData = filtered.map((r, i) => ({
    name: `${getTypeLabel(r.type)} ${i + 1}`,
    score: normalizeScore(r),
    type: r.type,
  }));

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <h2 style={styles.heading}>📊 Cogniscan Results</h2>

        {/* 🔘 FILTERS */}
        <div style={styles.filters}>
          {["all", "cognitive", "risk", "functional"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                background: filter === f ? "#1976d2" : "white",
                color: filter === f ? "white" : "#333",
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 📊 CARDS */}
        <div style={styles.grid}>
          {filtered.map((r, index) => {
            const score = normalizeScore(r);

            return (
              <div key={index} style={styles.card}>
                <h3>{getTypeLabel(r.type)}</h3>

                <p
                  style={{
                    ...styles.score,
                    color: getColor(score, r.type),
                  }}
                >
                  {score} / 100
                </p>

                <p
                  style={{
                    fontSize: "13px",
                    marginTop: "6px",
                    fontWeight: "500",
                    color: getColor(score, r.type),
                  }}
                >
                  {getLabel(score, r.type)}
                </p>

                {/* PROGRESS */}
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${score}%`,
                      background: getColor(score, r.type),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 📊 CHART */}
        <div style={styles.chartBox}>
          <h3>Performance Overview</h3>

          {chartData.length === 0 ? (
            <p>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={getColor(entry.score, entry.type)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px 20px",
    minHeight: "100vh",
    background: "linear-gradient(to right, #eef2f7, #f9fbfd)",
  },

  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },

  filters: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "25px",
  },

  filterBtn: {
    padding: "8px 14px",
    borderRadius: "20px",
    border: "1px solid #ddd",
    cursor: "pointer",
    fontSize: "13px",
  },

  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
  },

  card: {
    width: "260px",
    padding: "20px",
    borderRadius: "16px",
    background: "white",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    textAlign: "center",
    transition: "0.3s",
  },

  score: {
    fontSize: "26px",
    fontWeight: "600",
    margin: "10px 0",
  },

  progressBar: {
    height: "10px",
    background: "#eee",
    borderRadius: "10px",
    overflow: "hidden",
    marginTop: "10px",
  },

  progressFill: {
    height: "100%",
    transition: "0.4s ease",
  },

  chartBox: {
    marginTop: "40px",
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    width: "90%",
    marginInline: "auto",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  },
};