import type { Config } from "tailwindcss";

// Theme extension mirrors DESIGN-SYSTEM.md §6.2 (tokens live as CSS vars in globals.css).
// Breakpoints follow HOMEPAGE-SECTIONS.md: primary globals 1100 / 768 / 480, others kept
// for component-local tweaks. `lg` is intentionally 1100px (the split-shell collapse point).
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
      lg: "1100px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          footer: "var(--ink-footer)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          deep: "var(--accent-deep)",
        },
        line: {
          DEFAULT: "var(--line)",
          2: "var(--line-2)",
        },
        card: {
          dark: "var(--card-dark)",
          "dark-ink": "var(--card-dark-ink)",
        },
      },
      borderRadius: {
        pill: "var(--r-pill)",
        card: "var(--r-card)",
        input: "var(--r-input)",
        chip: "var(--r-chip)",
      },
      fontFamily: {
        sans: ["var(--font-onest)", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "serif"],
      },
      spacing: {
        "6.5": "1.625rem",
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.2, 0.9, 0.2, 1)",
      },
      letterSpacing: {
        tightest: "-0.045em",
        tighter: "-0.035em",
        eyebrow: "0.18em",
      },
      keyframes: {
        "scroll-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        livepulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(198,251,80,.5)" },
          "80%, 100%": { boxShadow: "0 0 0 12px rgba(198,251,80,0)" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        marquee: "scroll-x 45s linear infinite",
        "marquee-slow": "scroll-x 70s linear infinite",
        livepulse: "livepulse 2.4s ease-out infinite",
        "spin-slow": "spin 14s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
