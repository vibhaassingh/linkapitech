import type { Config } from "tailwindcss";

// "Institutional Light" theme extension — tokens live as CSS vars in globals.css.
// Breakpoints are Tailwind defaults plus xs; `lg` is back to 1024 (the old 1100
// existed only for the retired split-shell layout).
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
        inverse: {
          DEFAULT: "var(--inverse)",
          2: "var(--inverse-2)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          inv: "var(--ink-inv)",
          "inv-2": "var(--ink-inv-2)",
        },
        navy: {
          "050": "var(--navy-050)",
          100: "var(--navy-100)",
          200: "var(--navy-200)",
          600: "var(--navy-600)",
          700: "var(--navy-700)",
          900: "var(--navy-900)",
          950: "var(--navy-950)",
        },
        steel: {
          DEFAULT: "var(--steel)",
          2: "var(--steel-2)",
        },
        line: {
          DEFAULT: "var(--line)",
          soft: "var(--line-soft)",
          inv: "var(--line-inv)",
        },
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        pill: "var(--r-pill)",
      },
      boxShadow: {
        menu: "var(--shadow-menu)",
        card: "var(--shadow-card)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      transitionDuration: {
        ui: "200ms",
        menu: "320ms",
        entrance: "900ms",
      },
      letterSpacing: {
        tighter: "-0.025em",
        tight: "-0.02em",
        eyebrow: "0.14em",
      },
      keyframes: {
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "spin-slow": "spin 14s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
