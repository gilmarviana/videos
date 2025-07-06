/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'netflix-red': '#E50914',
        'netflix-black': '#000000',
        'netflix-darkGray': '#141414',
        'netflix-mediumGray': '#2F2F2F',
        'netflix-lightGray': '#B3B3B3',
      },
      fontFamily: {
        'netflix': ['Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}