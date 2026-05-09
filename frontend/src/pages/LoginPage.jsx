import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* 🧠 LOGO */}
        <h1 style={styles.logo}>🧠 CogniScan</h1>

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Login to continue</p>

        {error && <p style={styles.error}>{error}</p>}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {/* BUTTON */}
        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>

        <p style={styles.footerText}>
          Don’t have an account?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #e3f2fd, #90caf9)", // 🔵 Cogniscan bg
    fontFamily: "Inter, sans-serif",
  },

  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "18px",
    width: "350px",
    boxShadow: "0 15px 40px rgba(25, 118, 210, 0.2)", // 🔵 blue shadow
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    textAlign: "center",
  },

  logo: {
    marginBottom: "5px",
    color: "#1976d2", // 🔵 primary blue
  },

  title: {
    margin: 0,
    fontWeight: "600",
    color: "#0d47a1",
  },

  subtitle: {
    fontSize: "14px",
    color: "#5c6bc0",
    marginBottom: "10px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #bbdefb",
    fontSize: "14px",
    outline: "none",
    transition: "0.2s",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #1976d2, #42a5f5)", // 🔵 Cogniscan gradient
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s",
  },

  error: {
    color: "#d32f2f",
    fontSize: "13px",
  },

  footerText: {
    fontSize: "13px",
    marginTop: "10px",
    color: "#555",
  },

  link: {
    color: "#1976d2",
    cursor: "pointer",
    fontWeight: "600",
  },
};