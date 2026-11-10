/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  },
  theme: {
    extend: {
      fontFamily: {
        // Brand font from the Rins packaging; the old names are kept so existing classes still work
        zentry: ["Montserrat", "sans-serif"],
        general: ["Montserrat", "sans-serif"],
        "circular-web": ["Montserrat", "sans-serif"],
        "robert-medium": ["Montserrat", "sans-serif"],
        "robert-regular": ["Montserrat", "sans-serif"],
        arabic: ["Cairo", "sans-serif"],
      },
      colors: {
        // Rins brand palette (from the logo)
        navy: {
          50: "#E6EDF8",
          100: "#C9D6EC",
          300: "#4A72B5",
          500: "#0B3A85",
          700: "#002A6C",
          900: "#001D4D",
          950: "#001233",
        },
        lime: {
          100: "#F1FBD2",
          200: "#CFF26B",
          300: "#A4E400",
          500: "#86BA00",
        },
      },
    },
  },
  plugins: [],
};
