/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./site/**/*.html", "./src/**/*.ts", "./src/**/*.css"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        header: "#0b1220",
        bg: "#0f1720",
        surface: "#111827",
        "muted-surface": "#0f1a25",
        text: "#e6eef6",
        subtle: "#9fb4c8",
        accent: "#2dd4bf",
        code: "#071025",
        border: "#1e293b"
      },
      fontFamily: {
        inter: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["Fira Code", "ui-monospace", "SFMono-Regular"]
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
