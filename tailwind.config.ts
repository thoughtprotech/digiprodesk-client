import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border-color)",
        textAlt: "var(--alt-text)",
        highlight: "var(--highlight)",
        text: "var(--default-text)",
      },
      fontFamily: {
        NunitoSans: ["Rubik", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
