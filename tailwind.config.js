/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      backdropBlur: { xs: '2px' },
      colors: {
        accent: '#9F7BFF',
        base:   '#0d0d12',
      },
    },
  },
};