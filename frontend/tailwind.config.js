/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      { DEFAULT:"#0f172a", secondary:"#1e293b", tertiary:"#334155" },
        border:  { DEFAULT:"#334155", light:"#475569" },
        text:    { DEFAULT:"#f1f5f9", muted:"#94a3b8", hint:"#64748b" },
        brand: {
          machete:    "#B5451B",
          workaholic: "#1F3864",
          palestra:   "#2E7D32",
          lonche:     "#6A1B9A",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}
