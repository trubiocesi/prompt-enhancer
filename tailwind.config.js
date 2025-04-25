/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      backdropBlur: { xs: "2px" },
      colors: {
        accent: "#9F7BFF",

        /* Dark default (base) */
        base: "#0d0d12",

        /* Light theme palette */
        light: {
          bg:     "#F9FAFB",           // page background
          card:   "rgba(255,255,255,0.8)", // translucent white cards
          text:   "#1A1A1A",           // primary text
          border: "rgba(0,0,0,0.12)",  // subtle borders
        },
      },
    },
  },
  plugins: [],
};
