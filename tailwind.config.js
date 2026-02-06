/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Background should use gray-50/gray-950 pattern, not a single color
        background: {
          DEFAULT: "hsl(0 0% 98%)",  // Light mode: nearly white
          dark: "hsl(240 10% 3.9%)", // Dark mode: nearly black
        },
        "background-light": "hsl(0 0% 100%)",
        primary: "hsl(248 85% 70%)",
        accent: "hsl(145 50% 75%)",
        destructive: "hsl(0 70% 60%)",
        warning: "hsl(45 90% 60%)",
        success: "hsl(145 50% 50%)",
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px",
      },
    },
  },
  plugins: [],
}
