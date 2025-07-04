/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          black: '#000000',
          darkGray: '#141414',
          mediumGray: '#2F2F2F',
          lightGray: '#B3B3B3',
        }
      },
      fontFamily: {
        'netflix': ['Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}