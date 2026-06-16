/** @type {import('tailwindcss').Config} */
const yellowScale = {
  50: '#fffceb',
  100: '#fff7c2',
  200: '#fff08a',
  300: '#ffe24d',
  400: '#ffd11a',
  500: '#e6b800',
  600: '#b38a00',
  700: '#806300',
  800: '#4d3c00',
  900: '#1f1700'
};

const neutralScale = {
  50: '#ffffff',
  100: '#ffffff',
  200: '#ffffff',
  300: '#ffffff',
  400: '#111111',
  500: '#111111',
  600: '#111111',
  700: '#111111',
  800: '#111111',
  900: '#111111'
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: yellowScale,
        secondary: neutralScale,
        red: yellowScale,
        orange: yellowScale,
        amber: yellowScale,
        yellow: yellowScale,
        lime: yellowScale,
        green: yellowScale,
        emerald: yellowScale,
        teal: yellowScale,
        cyan: yellowScale,
        sky: yellowScale,
        blue: yellowScale,
        indigo: yellowScale,
        violet: yellowScale,
        purple: yellowScale,
        fuchsia: yellowScale,
        pink: yellowScale,
        rose: yellowScale,
        slate: neutralScale,
        gray: neutralScale,
        zinc: neutralScale,
        neutral: neutralScale,
        stone: neutralScale
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
