/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["*"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      keyframes: {
        slide: {
          "0%": {
            transform: "translateX(-25%)",
          },
          "100%": {
            transform: "translateX(25%)",
          },
        },
      },

      animation: {
        slide: "slide 3s ease-in-out infinite alternate",
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};
