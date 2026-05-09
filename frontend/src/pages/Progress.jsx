import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Progress() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/results", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ FIXED
        },
      });

      const data = await res.json();

      console.log("API DATA:", data); // ✅ debug

      // ✅ ALWAYS ENSURE ARRAY
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setResults([]);
    }
  };

  // ✅ SAFE DATA
  const safeResults = Array.isArray(results) ? results : [];

  const totalTests = safeResults.length;

  const avgScore =
    totalTests > 0
      ? (
          safeResults.reduce((sum, r) => sum + (r.score || 0), 0) /
          totalTests
        ).toFixed(1)
      : 0;

  const latestScore = safeResults[0]?.score || 0;

  const bestScore =
    totalTests > 0
      ? Math.max(...safeResults.map((r) => r.score || 0))
      : 0;

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <h2 style={styles.heading}>📈 Progress Dashboard</h2>

        {/* 🔥 CARDS */}
        <div style={styles.cards}>
          <div style={styles.card}>
            <h3>Average Score</h3>
            <p>{avgScore} / 100</p>
          </div>

          <div style={styles.card}>
            <h3>Best Score</h3>
            <p>{bestScore} / 100</p>
          </div>

          <div style={styles.card}>
            <h3>Total Tests</h3>
            <p>{totalTests}</p>
          </div>

          <div style={styles.card}>
            <h3>Latest Score</h3>
            <p>{latestScore} / 100</p>
          </div>
        </div>

        {/* 📊 EMPTY STATE */}
        {totalTests === 0 && (
          <p style={{ marginTop: "20px", color: "#666" }}>
            No test data available yet
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
    fontFamily: "Inter, sans-serif",
    textAlign: "center",
  },

  heading: {
    marginBottom: "30px",
    fontWeight: "600",
  },

  cards: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  card: {
    background: "white",
    padding: "25px",
    width: "200px",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transition: "0.2s",
  },
};