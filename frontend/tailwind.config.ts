import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Page & surface
        canvas: "#F5F7FA",
        surface: "#FFFFFF",

        // Navy family (primary text)
        navy: {
          DEFAULT: "#0B1F3A",
          light: "#1E3352",
          muted: "#4A5A72",
          faint: "#8A9AB2",
          ghost: "#E4EAF2",
        },

        // Teal (primary accent — trustworthy, premium)
        teal: {
          DEFAULT: "#0D7377",
          dark: "#095255",
          light: "#14A085",
          faint: "#E4F5F5",
          "50": "#F0FAFA",
        },

        // Gold (luxury accent)
        gold: {
          DEFAULT: "#C49A1A",
          dark: "#9A7612",
          light: "#E8B830",
          faint: "#FDF6E3",
        },

        // Borders & dividers
        border: "#E2E8F0",
        "border-strong": "#C8D4E4",

        // Status
        success: "#16A34A",
        warning: "#D97706",
        error: "#DC2626",
      },

      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 6px -1px rgb(0 0 0 / 0.06)",
        modal: "0 20px 60px -15px rgb(0 0 0 / 0.25)",
      },

      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
