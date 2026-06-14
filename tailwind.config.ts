import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0E1A",
        surface: "#111827",
        card: "#1C2333",
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E8C86E",
        },
        ink: {
          primary: "#F0F0F0",
          secondary: "#9CA3AF",
        },
        boardline: "rgba(201, 168, 76, 0.2)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
