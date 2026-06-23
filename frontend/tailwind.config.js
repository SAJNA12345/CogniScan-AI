/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f6f8fb",
        surface: "#ffffff",
        line: "#e6eaf0",
        ink: { DEFAULT: "#0f172a", soft: "#475569", faint: "#94a3b8" },
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem", "3xl": "1.75rem" },
      boxShadow: {
        bento: "0 1px 2px rgba(16,24,40,.04), 0 10px 30px -12px rgba(16,24,40,.14)",
        "bento-hover":
          "0 2px 6px rgba(16,24,40,.06), 0 22px 48px -14px rgba(20,184,166,.30)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(1200px 600px at 80% -10%, rgba(20,184,166,.10), transparent 60%)",
      },
    },
  },
  plugins: [],
};
