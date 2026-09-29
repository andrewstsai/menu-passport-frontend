import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        wordmark: ['"Marcellus SC"', "Georgia", "serif"],
      },
      colors: {
        paper: "hsl(var(--paper))",
        ink: "hsl(var(--ink))",
        pencil: "hsl(var(--pencil))",
        rule: "hsl(var(--rule))",
        highlighter: "hsl(var(--highlighter))",
        stop: "hsl(var(--stop))",
        passport: "hsl(var(--cover))",
        foil: "hsl(var(--foil))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
} satisfies Config;
