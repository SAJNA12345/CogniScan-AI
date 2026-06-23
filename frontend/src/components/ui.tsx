import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";

/* ---------------- Bento card ---------------- */
export function Bento({
  children,
  className,
  interactive = false,
  onClick,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={interactive ? { y: -5 } : undefined}
      onClick={onClick}
      className={cn(
        "bento bento-pad",
        interactive &&
          "cursor-pointer transition-shadow duration-300 hover:shadow-bento-hover",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Button ---------------- */
const btnVariants: Record<string, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/30",
  ghost: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  outline: "border border-line text-ink-soft hover:bg-slate-50",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: {
  variant?: keyof typeof btnVariants;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        btnVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------- Badge ---------------- */
const badgeTones: Record<string, string> = {
  brand: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-rose-50 text-rose-700",
  slate: "bg-slate-100 text-slate-600",
};

export function Badge({
  tone = "slate",
  children,
  className,
}: {
  tone?: keyof typeof badgeTones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- Field (labeled input) ---------------- */
export function Field({
  label,
  className,
  ...props
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">
          {label}
        </span>
      )}
      <input
        className={cn(
          "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100",
          className
        )}
        {...props}
      />
    </label>
  );
}

/* ---------------- Score ring (0–100) ---------------- */
export function ScoreRing({
  value,
  size = 120,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value || 0));
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = v >= 70 ? "#10b981" : v >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#eef1f6" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (v / 100) * c }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold text-ink">{Math.round(v)}</span>
        {label && <span className="text-[11px] text-ink-faint">{label}</span>}
      </div>
    </div>
  );
}

/* ---------------- Spinner ---------------- */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500",
        className
      )}
    />
  );
}

/* ---------------- Page heading ---------------- */
export function PageHeading({
  icon,
  title,
  subtitle,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}
