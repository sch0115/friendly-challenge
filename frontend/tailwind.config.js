/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
  ],
  daisyui: {
    themes: ["autumn"],
    darkTheme: "autumn",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
  },
} 