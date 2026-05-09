import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  const navigate = useNavigate();

  const handleHover = (e, enter) => {
    if (enter) {
      e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
      e.currentTarget.style.boxShadow =
        "0 15px 35px rgba(0,0,0,0.2)";
    } else {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow =
        "0 8px 25px rgba(0,0,0,0.1)";
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.title}>🧠 CogniScan</h1>
        <p style={styles.subtitle}>
          AI-powered cognitive, speech & pattern analysis for early detection
        </p>

        <div style={styles.cardContainer}>
          {/* 🧠 Cognitive */}
          <div
            style={{
              ...styles.card,
              background: "linear-gradient(135deg, #1976d2, #42a5f5)",
            }}
            onClick={() => navigate("/cognitive")}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
          >
            <div style={styles.icon}>🧠</div>
            <h3 style={styles.cardTitle}>Cognitive Test</h3>
            <p style={styles.cardDesc}>
              Evaluate memory, logic, and attention skills
            </p>
          </div>

          

          <div
            style={{
              ...styles.card,
              background: "linear-gradient(135deg, #1976d2, #42a5f5)",
            }}
            onClick={() => navigate("/risk")}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
          >
            <div style={styles.icon}>⚠️</div>

            <h3 style={styles.cardTitle}>Risk Factors</h3>

            <p style={styles.cardDesc}>
              Understand key dementia risk factors
            </p>
          </div>

          {/* 🧩 Pattern */}
          <div
            style={{
              ...styles.card,
              background: "linear-gradient(135deg, #1976d2, #42a5f5)",
            }}
            onClick={() => navigate("/functional")}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
          >
            <div style={styles.icon}>🧾</div>

            <h3 style={styles.cardTitle}>Functional Assessment</h3>

            <p style={styles.cardDesc}>
              Evaluate daily life abilities and independence
            </p>
          </div>

          {/* 📊 Results */}
          <div
            style={{
              ...styles.card,
              background: "linear-gradient(135deg, #1976d2, #42a5f5)",
            }}
            onClick={() => navigate("/results")}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
          >
            <div style={styles.icon}>📊</div>
            <h3 style={styles.cardTitle}>View Results</h3>
            <p style={styles.cardDesc}>
              Track performance and insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #eef2f7, #f9fbfd)",
  },

  container: {
    textAlign: "center",
    padding: "60px 20px",
  },

  title: {
    fontSize: "40px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "10px",
  },

  subtitle: {
    color: "#555",
    fontSize: "16px",
    marginBottom: "50px",
  },

  cardContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    flexWrap: "wrap",
  },

  card: {
    width: "260px",
    padding: "28px",
    borderRadius: "18px",
    color: "white",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
  },

  icon: {
    fontSize: "42px",
    marginBottom: "15px",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
  },

  cardDesc: {
    fontSize: "14px",
    opacity: 0.9,
  },
};