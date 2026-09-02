/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        sentinel: {
          bg: "#0A0B0E",
          card: "#12141A",
          cardHover: "#181B24",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(255, 255, 255, 0.16)",
          muted: "#94A3B8",
          dim: "#64748B",
          dark: "#050608",
          green: "#10B981",
          greenGlow: "rgba(16, 185, 129, 0.15)",
          red: "#F43F5E",
          redGlow: "rgba(244, 63, 94, 0.15)",
          indigo: "#6366F1",
          indigoGlow: "rgba(99, 102, 241, 0.15)",
          purple: "#8B5CF6",
          amber: "#F59E0B",
          amberGlow: "rgba(245, 158, 11, 0.15)",
          cyan: "#06B6D4",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "SFMono-Regular",
          "monospace",
        ],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)",
        cardHover: "0 8px 30px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12)",
        glowGreen: "0 0 24px -4px rgba(16, 185, 129, 0.3)",
        glowIndigo: "0 0 24px -4px rgba(99, 102, 241, 0.3)",
        glowRed: "0 0 24px -4px rgba(244, 63, 94, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.25s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}
