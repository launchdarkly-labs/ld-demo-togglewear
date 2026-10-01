/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1536px",
      },
    },
    extend: {
      // ToggleWear design tokens pulled from Jen's Figma file go here.
    },
  },
  plugins: [],
};
