/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      backdropBlur: { xs: "2px" },
      colors: {
               accent: {
                   DEFAULT: "#FF6F61",  // Warm Coral base
                   dark:    "#E65A50",  // deeper coral on hover/dark uses
                   light:   "#FFD8D2"   // soft tint for gradients
                 },

        base: "#0d0d12",      // your existing dark-ground

        light: {
          bg:     "#F9FAFB",
          card:   "rgba(255,255,255,0.8)",
          text:   "#1A1A1A",
          border: "rgba(0,0,0,0.12)"
        }
      }
    }
  },
  plugins: []
};