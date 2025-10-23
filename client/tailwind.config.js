/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    fontFamily: {
      main: ["Inter", "sans-serif"],
      alt: ["Manrope", "sans-serif"],
    },
    listStyleType: {
      none: "none",
      disc: "disc",
      decimal: "decimal",
      square: "square",
      roman: "upper-roman",
    },
    extend: {
      width: {
        main: "1350px",
      },
      gridRow: {
        "span-7": "span 7 / span 7",
      },
      gridTemplateRows: {
        // Simple 8 row grid
        10: "repeat(10, minmax(0, 1fr))",

        // Complex site-specific row configuration
        layout: "200px minmax(900px, 1fr) 100px",
      },
      backgroundColor: {
        main: "#00AFFF",
        overlay: "rgba(0,0,0,0.7)",
      },
      colors: {
        /**
         * Vung-Loai-ChiTiet
         */
        //App
        main: "#ee3131",
        "app-bg": "#F2F4F7",
        "app-fg": "#000000",

        //text
        "text-ac": "#1B6FCF",

        //Auth
        "auth-text": "#0OOOOOO",
        "auth-text-ac": "#1B6FCF",

        //menu
        "menu-hover": "#E2E5E9",

        //sidebar
        "sidebar-bg": "#FFFFFF",
        "sidebar-bg-select": "#E5E5E5",
        "sidebar-t-select": "#0074FF",
        "sidebar-hv": "#EAEAEA",

        //Input
        "input-bg": "#E2E5E9",
        "input-fc": "#8AB1F9",

        //button
        "button-bg": "#E2E5E9",
        "button-hv": "#D1D5DC",
        "button-bg-ac": "#0071E3",
        "button-bg-hv": "#1E4ED8",

        "button-t-hv": "#0074FF",
        "button-bd-ac": "#2563eb",

        //options
        "options-bg": "#E3E3E4",

        //card
        "card-bg": "#fefefe",
        "card-t-price": "#ee3131",

        "gray-sidebar": "#E0E2E6",
        "blue-selected": "#57A0FF",
        "title-table": "#57A0FF",
        "header-footer": "#FFF",
        "gray-apple": "#F5F5F7",
        "gray-action": "#E2E5E9",
        //state
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        info: "#0EA5E9",
      },
      flex: {
        2: "2 2 0%",
        3: "3 3 0%",
        4: "4 4 0%",
        5: "5 5 0%",
        6: "6 6 0%",
        7: "7 7 0%",
        8: "8 8 0%",
      },
      keyframes: {
        "slide-top": {
          "0%": {
            "-webkit-transform": " translateY(20px);",
            transform: "translateY(20px);",
          },
          "100%": {
            "-webkit-transform": "translateY(0px);",
            transform: "translateY(0px);",
          },
        },
        "slide-top-sm": {
          "0%": {
            "-webkit-transform": " translateY(8px);",
            transform: "translateY(8px);",
          },
          "100%": {
            "-webkit-transform": "translateY(0px);",
            transform: "translateY(0px);",
          },
        },
        "slide-right": {
          "0%": {
            "-webkit-transform": "translateX(-1000px);",
            transform: "translateX(-1000px);",
          },
          "100%": {
            "-webkit-transform": "translateX(0);",
            transform: "translateX(0);",
          },
        },
        "scale-up-center": {
          "0%": {
            "-webkit-transform": "scale(0.5);",
            transform: "scale(0.5);",
          },
          "100%": {
            "-webkit-transform": "scale(1);",
            transform: "scale(1);",
          },
        },
      },
      animation: {
        "slide-top":
          "slide-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;",
        "slide-top-sm": "slide-top-sm 0.2s linear both;",
        "slide-right":
          "slide-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;",
        "scale-up-center":
          "scale-up-center 0.15s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;",
      },

      scale: {
        103: "1.02",
      },
      boxShadow: {
        card: "0 4px 10px rgba(0, 0, 0, 0.1)", // shadow mềm
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/forms")({ strategy: "class" }),
  ],
};
