/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand
        primary: "#E9E8FF",
        secondary: "#BF60B5",

        // Contrast on brand
        "primary-on-light": "#FFFFFF",
        "primary-on-dark": "#000000",
        "secondary-on-light": "#FFFFFF",
        "secondary-on-dark": "#000000",

        // Background & surfaces
        background: {
          DEFAULT: "#F4F4F7",
          dark: "#121212",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#1E1E22",
        },
        border: {
          DEFAULT: "#E5E7EB",
          dark: "#2D2D33",
        },

        // Text
        textPrimary: {
          DEFAULT: "#111827",
          dark: "#F9FAFB",
        },
        textSecondary: {
          DEFAULT: "#4B5563",
          dark: "#9CA3AF",
        },

        // Palette (purple / pink)
        "dark-purple": "#040225",
        "dark-purple-semitransparent": "#040226",
        "dark-purple-transparent": "#040225",
        "black-purple": "#28164e",
        "black-purple-semitransparent": "#28164e",
        purple: "#462671",
        "light-purple": "#73389d",
        pink: "#bf30b5",
      },
      borderRadius: {
        lg: "8px",
      },
      fontFamily: {
        sans: [
          "Roboto",
          "\"Neue Montreal\"",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
}
