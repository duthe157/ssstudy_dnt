/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3f51b5",
          light: "#757de8",
          dark: "#002984",
        },
        secondary: {
          DEFAULT: "#f50057",
          light: "#ff5983",
          dark: "#bb002f",
        },
        border: "#E8E8E8",
        text: {
          title: "#333333",
        },
        grey: {
          50: "#EAEAEA",
          60: "#CCCCCC",
          90: "#4D4D4D",
          100: "#FFF6EF",
          200: "#E3ECFB",
          300: "#F5F5F5",
          400: "#D9D9D9",
        },
        accent: "#E9EAED",
        foundation: {
          50: "#E9EFFA",
          75: "#E9EAED",
          100: "#BBBDC7",
          200: "#9A9DAC",
          300: "#6C7086",
          400: "#50556F",
          500: "#686868",
          800: "#242938",
          900: "#242A4B",
        },
        red: {
          500: "#F44336",
        },
        blue: {
          300: "#6C92E0",
          400: "#4F7DD9",
          500: "#235CD0",
          800: "#003899",
        },
        orange: {
          50: "#FEECEB",
          500: "#F44336",
          700: "#AD3026",
        },
        purple: {
          50: "#F2F2FF",
          700: "#555BB5",
        },
        green: {
          50: "#EEF9ED",
          700: "#3B8D34",
        },
        button: "#2D2D2D",
      },
      fontSize: {
        xl40: "40px",
        lg24: "28px",
      },
      lineHeight: {
        8.5: "34px",
        12: "48px",
      },
      boxShadow: {
        "custom-light": "0px 4px 12.4px 0px rgba(0, 0, 0, 0.05)",
      },
      animation: {
        "skeleton-loading": "skeleton-loading 1.4s ease infinite",
        slideDown: "slideDown 300ms ease-out",
        slideUp: "slideUp 300ms ease-out",
        slideIn: "slideIn 0.3s ease-out",
        slideOut: "slideOut 0.3s ease-in",
      },
      keyframes: {
        "skeleton-loading": {
          "0%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        slideDown: {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        slideUp: {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        slideIn: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        slideOut: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};
