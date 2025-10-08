/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        famboard: {
          primary: '#1f7a8c',
          accent: '#ffb703',
          surface: '#f8fafc',
          dark: '#0b3d4a',
        },
      },
      boxShadow: {
        card: '0 12px 30px rgba(31, 122, 140, 0.12)',
      },
    },
  },
  plugins: [],
}
