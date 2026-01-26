/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#0a1628',
          800: '#0f1f3a',
          700: '#1a2942',
          600: '#1e3a5f',
        },
        accent: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          pink: '#ec4899',
        }
      }
    },
  },
  plugins: [],
}
