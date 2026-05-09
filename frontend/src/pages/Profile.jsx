import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setName(storedUser.name);
      setEmail(storedUser.email);
    }
  }, []);

  // ✅ UPDATE PROFILE
  const handleUpdate = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/user/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (res.ok) {
    // ✅ update local storage
    localStorage.setItem("user", JSON.stringify(data.user));

    // ✅ update UI instantly
    setUser(data.user);

    // ✅ exit edit mode
    setEditMode(false);

    alert("Profile updated!");
  } else {
    alert(data.message);
  }
};
  // ✅ DELETE ACCOUNT
  const handleDelete = async () => {
  const confirmDelete = window.confirm("Are you sure?");
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/user/delete", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,   // ✅ FIXED
    },
  });

  const data = await res.json();
  console.log("DELETE RESPONSE:", data);

  if (res.ok) {
    localStorage.clear();
    alert("Account deleted");
    navigate("/");
  } else {
    alert(data.message || "Delete failed");
  }
};

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.card}>
          <h2>👤 Profile</h2>

          {!editMode ? (
            <>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>

              <button onClick={() => setEditMode(true)} style={styles.btn}>
                Edit Profile
              </button>

              <button onClick={handleDelete} style={styles.delete}>
                Delete Account
              </button>
            </>
          ) : (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
              <input
                type="password"
                placeholder="New Password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <button onClick={handleUpdate} style={styles.btn}>
                Save
              </button>

              <button onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </>
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
    marginTop: "40px",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "350px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  btn: {
    background: "#4A90E2",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  delete: {
    background: "red",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};