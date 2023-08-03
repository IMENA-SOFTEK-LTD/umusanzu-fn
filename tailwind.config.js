/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E7A84',
        secondary: '#E4B7A0',
        tertiary: '#A45C40',
        accent: '#C38370',
        primaryBlue: '#6366F1'
      },
      fontFamily: {
        primary: "'Montserrat', sans-serif",
        secondary: "'Playfair Display', serif",
      },
    },
  },
  plugins: [],
}
