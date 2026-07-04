/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Light mode tokens ---
        cream: "#F7F5EF",        // page background, off-white not pure white
        surface: "#FFFFFF",      // card surfaces
        "surface-muted": "#F1EEE6", // metric card background
        hairline: "#D9D7CE",     // borders / dividers
        ink: "#1A1A18",          // primary text
        muted: "#5F5E5A",        // secondary text / captions
        teal: "#0F6E56",         // primary brand
        "teal-tint": "#E1F5EE",  // positive backgrounds, chart fills
        coral: "#993C1D",        // warnings, single accent category
        "coral-tint": "#FAECE7", // anomaly/alert backgrounds
        purple: "#3C3489",       // secondary category accent

        // --- Dark mode tokens (lightness raised for contrast on dark bg) ---
        "cream-dark": "#15171A",
        "surface-dark": "#1C1F23",
        "surface-muted-dark": "#20242A",
        "hairline-dark": "#2E3237",
        "ink-dark": "#EDEBE4",
        "muted-dark": "#9B9992",
        "teal-dark": "#2FBF9B",
        "teal-tint-dark": "#16332B",
        "coral-dark": "#E08A5E",
        "coral-tint-dark": "#33221B",
        "purple-dark": "#9A90E8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "page-title": ["22px", { lineHeight: "28px", fontWeight: "500" }],
        "section-heading": ["15px", { lineHeight: "20px", fontWeight: "500" }],
        body: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        metric: ["24px", { lineHeight: "30px", fontWeight: "500" }],
        caption: ["13px", { lineHeight: "18px", fontWeight: "400" }],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        // bold/black weights intentionally not extended — brief calls for
        // only Regular and Medium anywhere in the product
      },
      borderRadius: {
        card: "10px",
        pill: "999px",
      },
      transitionDuration: {
        subtle: "150ms",
      },
    },
  },
  plugins: [],
};
