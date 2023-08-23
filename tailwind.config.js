/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#165F75',
        secondary: '#E4B7A0',
        tertiary: '#A45C40',
      },
      fontFamily: {
        primary: "'Montserrat', sans-serif",
        secondary: "'Playfair Display', serif",
      },
    },
  },
  plugins: [],
}
