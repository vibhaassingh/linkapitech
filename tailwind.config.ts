import type { Config } from "tailwindcss";

// "Figma Purple" theme extension — tokens live as CSS vars in globals.css.
// navy/steel/inverse keys are TEMP compat aliases (mapped to plum values in
// :root) so not-yet-rebuilt components keep rendering; remove in Phase 6.
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
        canvas: {
          DEFAULT: "var(--canvas)",
          2: "var(--canvas-2)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
        tint: "var(--card-tint)",
        plum: {
          600: "var(--plum-600)",
          700: "var(--plum-700)",
          800: "var(--plum-800)",
          900: "var(--plum-900)",
          950: "var(--plum-950)",
        },
        violet: {
          500: "var(--violet-500)",
          600: "var(--violet-600)",
          text: "var(--violet-text)",
        },
        lavender: {
          200: "var(--lavender-200)",
          300: "var(--lavender-300)",
          400: "var(--lavender-400)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          inv: "var(--ink-inv)",
          "inv-2": "var(--ink-inv-2)",
        },
        success: "var(--success)",
        line: {
          DEFAULT: "var(--line)",
          soft: "var(--line-soft)",
          inv: "var(--line-inv)",
        },
        // ---- TEMP compat aliases (Institutional Light keys) ----
        inverse: {
          DEFAULT: "var(--inverse)",
          2: "var(--inverse-2)",
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
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
        pill: "var(--r-pill)",
      },
      boxShadow: {
        menu: "var(--shadow-menu)",
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
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
        tighter: "-0.02em",
        tight: "-0.015em",
        eyebrow: "0.13em",
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
