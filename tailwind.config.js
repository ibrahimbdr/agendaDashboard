/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "scale-up-tr":
          "scale-up-tr 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both",
      },
      keyframes: {
        "scale-up-tr": {
          "0%": {
            transform: "translateX(100%)",
            transformOrigin: "100% 100%",
          },
          "90%": {
            transform: "translateX(-10%)",
            transformOrigin: "100% 100%",
          },
          "100%": {
            transform: "translateX(0%)",
            transformOrigin: "100% 100%",
          },
        },
      },
    },
  },
  plugins: [],
};
