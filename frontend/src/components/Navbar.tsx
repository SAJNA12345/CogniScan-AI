import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, LayoutDashboard, LineChart, FileText, User, LogOut } from "lucide-react";
import { cn, isAuthed } from "../lib/utils";

const links = [
  { to: "/home", label: "Dashboard", icon: LayoutDashboard },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/report", label: "Report", icon: FileText },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const navigate = useNavigate();
  const authed = isAuthed();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-line bg-white/80 backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/home" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/40">
            <Brain size={18} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">
            Cogni<span className="text-brand-600">Scan</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-soft hover:bg-slate-50 hover:text-ink"
                )
              }
            >
              <l.icon size={16} />
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {authed ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-500/30 hover:bg-brand-600"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
