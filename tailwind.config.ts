import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#0a0a0a",
        "surface-light": "#0f0f0f",
        "surface-hover": "#141414",
        border: "#1a1a1a",
        "border-light": "#242424",
        primary: "#22c55e",
        "primary-dark": "#16a34a",
        secondary: "#3b82f6",
        accent: "#eab308",
        danger: "#ef4444",
        muted: "#555555",
        "text-primary": "#ffffff",
        "text-secondary": "#888888",
        "text-muted": "#555555",
      },
      fontFamily: {
        sans: ["Satoshi", "system-ui", "sans-serif"],
        mono: ["SF Mono", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
