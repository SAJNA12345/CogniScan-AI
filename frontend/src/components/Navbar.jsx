import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  // ✅ SAFE USER PARSING (handles undefined, null, invalid JSON)
  let user = null;
  const storedUser = localStorage.getItem("user");

  if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
    try {
      user = JSON.parse(storedUser);
    } catch (e) {
      console.error("Invalid user JSON");
      user = null;
    }
  }

  // ✅ Logout
  const handleLogout = () => {
  localStorage.clear();   // remove token + user
  navigate("/");          // go to landing page (home)
};

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>🧠 CogniScan AI</div>

      <div style={styles.links}>
        <Link to="/home" style={styles.link}>Dashboard</Link>
        <Link to="/profile" style={styles.link}>Profile</Link>
        <Link to="/report" style={styles.link}>Report</Link>
        <Link to="/progress" style={styles.link}>Progress</Link>

        {!user ? (
          <>
            <Link to="/login" style={styles.login}>Login</Link>
            <Link to="/signup" style={styles.signup}>Signup</Link>
          </>
        ) : (
          <>
            <span style={styles.user}>👤 {user?.name}</span>
            <button onClick={handleLogout} style={styles.logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "#4A90E2",
    color: "#fff",
  },
  logo: { fontWeight: "bold", fontSize: "20px" },
  links: { display: "flex", gap: "15px", alignItems: "center" },
  link: { color: "white", textDecoration: "none" },
  login: {
    border: "1px solid white",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "white",
  },
  signup: {
    background: "white",
    color: "#4A90E2",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: "bold",
  },
  user: { fontWeight: "bold" },
  logout: {
    background: "red",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};