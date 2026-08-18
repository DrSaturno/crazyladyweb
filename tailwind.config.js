/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0a0a0a",
          800: "#131313",
          700: "#1b1b1b",
          600: "#242424",
          500: "#333333",
        },
        cls: {
          primary: "#C026D3",
          "primary-dark": "#86198F",
          green: "#22C55E",
          "green-dark": "#15803D",
          pink: "#EC4899",
        },
      },
      backgroundImage: {
        "cls-gradient": "linear-gradient(90deg, #22C55E 0%, #C026D3 55%, #EC4899 100%)",
      },
    },
  },
  plugins: [],
};
