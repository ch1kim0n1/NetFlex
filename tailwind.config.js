/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  darkMode: 'selector',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          black: "#000000",
          dark: "#141414",
          gray: "#2F2F2F",
          "gray-light": "#404040",
          red: "#E50914",
          "red-dark": "#B20710",
          white: "#FFFFFF",
          "text-gray": "#B3B3B3",
          "text-muted": "#8C8C8C",
        },
        primary: {
          DEFAULT: "#141414",
          light: "#2F2F2F",
          hover: "#404040",
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          light: "#B3B3B3",
          hover: "#8C8C8C"
        },
        accent: {
          DEFAULT: "#E50914",
          light: "#FF1E2D",
          dark: "#B20710",
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
        h1: { fontSize: theme("fontSize.3xl") }, // 24px
        h2: { fontSize: theme("fontSize.2xl") }, // 20px
        h3: { fontSize: theme("fontSize.xl") }, // 18px
        // h4, h5, h6, p - 16px;
      });
    }),
  ],
};
