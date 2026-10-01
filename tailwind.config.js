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
      // Mirrors the variable groups in Jen's Figma file (Demo-ToggleWear-2026)
      // so a token name in the design maps straight onto a class name here.
      // Namespaced as base-* / grays-* to avoid overwriting Tailwind's own
      // blue, lime, gray and black scales.
      colors: {
        base: {
          lime: "#DDFF46",
          blue: "#405BFF",
          orange: "#FF9D29",
          cyan: "#3DD6F5",
        },
        grays: {
          white: "#FFFFFF",
          "01": "#F8F8F8",
          "02": "#D1D6D9",
          "03": "#A7A9AC",
          "04": "#6D6E71",
          "black-01": "#101010",
          "ld-black": "#191919",
        },
      },
      fontFamily: {
        // Sora and Geist are loaded through next/font in pages/_app.tsx.
        sora: ["var(--font-sora)", "sans-serif"],
        // Jen uses Geist SemiBold for two small uppercase labels: the NEW
        // badge on product cards and the swag assistant launcher. Unlike
        // Söhne it is openly licensed and served by next/font, so it needs
        // nothing from the design team.
        geist: ["var(--font-geist)", "Inter", "sans-serif"],
        // Söhne is a licensed Klim Type Foundry face and is not yet in the
        // repo; until the woff2 files arrive these fall back to the closest
        // available neo-grotesque.
        sohne: [
          "Söhne",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        "sohne-mono": [
          "Söhne Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      // Letter-spacing in Figma is a percentage of font size; these are the
      // resolved pixel values.
      fontSize: {
        h1: ["64px", { lineHeight: "1", letterSpacing: "-3.2px" }],
        h2: ["56px", { lineHeight: "1.05", letterSpacing: "-2.8px" }],
        h3: ["40px", { lineHeight: "1.05", letterSpacing: "-2px" }],
        // Web H6 — the product detail price.
        h6: ["20px", { lineHeight: "1.15", letterSpacing: "-0.4px" }],
        main: ["16px", { lineHeight: "1.55", letterSpacing: "0" }],
        // Web Text Large, Medium — the Add to Cart / Wishlist buttons.
        "large-medium": ["18px", { lineHeight: "1.35", letterSpacing: "0" }],
        "main-medium": ["16px", { lineHeight: "1.55", letterSpacing: "-0.48px" }],
        small: ["14px", { lineHeight: "1.4", letterSpacing: "0" }],
        xsmall: ["12px", { lineHeight: "1.5", letterSpacing: "0" }],
        "xsmall-mono": ["12px", { lineHeight: "1.5", letterSpacing: "0.36px" }],
      },
    },
  },
  plugins: [],
};
