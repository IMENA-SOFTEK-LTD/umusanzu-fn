/** @type {import('tailwindcss').Config} */
export default {

    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#F6EEE0',
          secondary: '#E4B7A0',
          tertiary: '#A45C40', // button color
          accent: '#C38370',
        },
        fontFamily: {
          primary: "'Montserrat', sans-serif",
          secondary: "'Playfair Display', serif",
        },
    }
  },
  plugins: []
}
