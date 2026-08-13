import type { Config } from "tailwindcss";

// "Figma Purple" theme extension — every value is a var() pointer at the tokens
// in globals.css, so the palette is reskinned from one place.
// NOTE: because these are var() colours, Tailwind's opacity modifier does not
// work on them (`bg-plum-600/40` compiles to nothing) — add an explicit
// translucent token in globals.css instead.
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
        surface: "var(--surface)",
        tint: "var(--card-tint)",
        plum: {
          600: "var(--plum-600)",
          700: "var(--plum-700)",
          800: "var(--plum-800)",
          900: "var(--plum-900)",
          950: "var(--plum-950)",
          // Pre-multiplied translucent plum — `bg-plum-600/8` does NOT work.
          a08: "var(--plum-a08)",
          a20: "var(--plum-a20)",
        },
        violet: {
          500: "var(--violet-500)",
          600: "var(--violet-600)",
          text: "var(--violet-text)",
          soft: "var(--violet-soft)",
          glow: "var(--violet-glow)",
          a24: "var(--violet-a24)",
        },
        // White veils for plum surfaces. A separate scale rather than entries on
        // `white`, because extending colors.white into an object would replace
        // the built-in string and break every existing `bg-white`.
        veil: {
          1: "var(--veil-1)",
          2: "var(--veil-2)",
          3: "var(--veil-3)",
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
          "inv-3": "var(--ink-inv-3)",
          "on-violet-2": "var(--ink-on-violet-2)",
        },
        success: "var(--success)",
        line: {
          DEFAULT: "var(--line)",
          soft: "var(--line-soft)",
          inv: "var(--line-inv)",
          plum: "var(--line-plum)",
          violet: "var(--line-violet)",
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
      // Spring easings pair with the matching duration — `ease-spring-smooth`
      // must always be used with `duration-spring-smooth`, or the sampled
      // overshoot lands at the wrong time. Values come from lib/springs.ts.
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
        "spring-snappy": "var(--spring-snappy)",
        "spring-smooth": "var(--spring-smooth)",
        "spring-gentle": "var(--spring-gentle)",
      },
      transitionDuration: {
        ui: "200ms",
        menu: "320ms",
        entrance: "900ms",
        "spring-snappy": "350ms",
        "spring-smooth": "550ms",
        "spring-gentle": "800ms",
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
