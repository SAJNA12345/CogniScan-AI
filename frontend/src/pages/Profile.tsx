import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Save, Trash2, X, Pencil } from "lucide-react";
import Layout from "../components/Layout";
import { Bento, Button, Field, Badge, PageHeading } from "../components/ui";

export default function Profile() {
  const [user, setUser] = useState<any>({});
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

    const res = await fetch("/api/user/update", {
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

      setMessage({ type: "success", text: "Profile updated!" });
    } else {
      setMessage({ type: "error", text: data.message });
    }
  };

  // ✅ DELETE ACCOUNT
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    const res = await fetch("/api/user/delete", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ FIXED
      },
    });

    const data = await res.json();
    console.log("DELETE RESPONSE:", data);

    if (res.ok) {
      localStorage.clear();
      setMessage({ type: "success", text: "Account deleted" });
      navigate("/");
    } else {
      setMessage({ type: "error", text: data.message || "Delete failed" });
    }
  };

  return (
    <Layout>
      <PageHeading
        icon={<User size={22} />}
        title="Profile"
        subtitle="Manage your account details and preferences"
      />

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 rounded-2xl px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid gap-6">
        {/* Edit profile */}
        <Bento className="rounded-3xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Edit profile</h2>
              <p className="text-sm text-ink-soft">Update your name, email and password</p>
            </div>
            {!editMode ? (
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Pencil size={16} /> Edit
              </Button>
            ) : (
              <Badge tone="brand">Editing</Badge>
            )}
          </div>

          {!editMode ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-white px-4 py-3">
                <span className="label">Name</span>
                <p className="mt-1 text-sm font-semibold text-ink">{user.name}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white px-4 py-3">
                <span className="label">Email</span>
                <p className="mt-1 text-sm font-semibold text-ink">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <Field
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Field
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Field
                label="New Password"
                type="password"
                placeholder="New Password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={handleUpdate}>
                  <Save size={16} /> Save
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  <X size={16} /> Cancel
                </Button>
              </div>
            </div>
          )}
        </Bento>

        {/* Danger zone */}
        <Bento className="rounded-3xl">
          <h2 className="text-lg font-bold text-ink">Danger zone</h2>
          <p className="mb-5 text-sm text-ink-soft">
            Permanently delete your account. This action cannot be undone.
          </p>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={16} /> Delete account
          </Button>
        </Bento>
      </div>
    </Layout>
  );
}
