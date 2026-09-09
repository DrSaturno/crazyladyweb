/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0C382C",
          800: "#174F3E",
          700: "#286650",
          600: "#4F806C",
          500: "#83A58F",
        },
        cls: {
          primary: "#174F3E",
          "primary-dark": "#0C382C",
          green: "#286650",
          "green-dark": "#174F3E",
          pink: "#E8753D",
          cream: "#F7F0DF",
          paper: "#FFF9EC",
          sage: "#BCD8BD",
          orange: "#E8753D",
          honey: "#F3B942",
          ink: "#17352C",
          line: "#DED3BC",
        },
      },
      backgroundImage: {
        "cls-gradient": "linear-gradient(90deg, #174F3E 0%, #E8753D 54%, #F3B942 100%)",
      },
      boxShadow: {
        paper: "0 8px 24px rgba(23, 53, 44, 0.08)",
        lift: "0 12px 28px rgba(23, 53, 44, 0.14)",
      },
    },
  },
  plugins: [],
};
