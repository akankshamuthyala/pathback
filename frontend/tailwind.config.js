/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#FAF5F8',
          100: '#F4EBF1',
          200: '#EAD6E4',
          300: '#D8B5D0',
          400: '#BE87B2',
          500: '#9F5F93',
          600: '#844377', // Core plum accent
          700: '#6F3563',
          800: '#5C2D52',
          900: '#4C2744',
          950: '#34152E',
        },
        peach: {
          50: '#FFF8F5',
          100: '#FEEDEA',
          200: '#FDD8CD',
          300: '#FCBAA7',
          400: '#F89278',
          500: '#EF6B4B', // Core warm peach accent
          600: '#DC5131',
          700: '#B93E23',
          800: '#963520',
          900: '#7A2F1F',
        },
        sky: {
          50: '#FAF5F8',
          100: '#FEEDEA',
          200: '#FDD8CD',
          300: '#D8B5D0',
          400: '#BE87B2',
          500: '#9F5F93',
          600: '#844377',
          700: '#6F3563',
          800: '#5C2D52',
          900: '#4C2744',
        },
        teal: {
          50: '#FFF8F5',
          100: '#FEEDEA',
          200: '#FDD8CD',
          300: '#FCBAA7',
          400: '#BE87B2',
          500: '#9F5F93',
          600: '#844377',
          700: '#6F3563',
          800: '#5C2D52',
          900: '#4C2744',
          950: '#FFF8F5',
        },
        sethu: {
          navy: {
            950: '#FAF5F8', // Plum canvas wash
            900: '#FFFFFF', // Crisp card surface
            850: '#FFF8F5', // Peach tint surface
            800: '#F2E6EC', // Plum-peach hairline border
            750: '#E7D4DE',
            700: '#9F5F93',
            600: '#844377',
            500: '#6F3563',
          },
          teal: {
            50: '#FFF8F5',
            100: '#FEEDEA',
            300: '#FCBAA7',
            400: '#F89278',
            500: '#844377',
            600: '#844377',
            700: '#6F3563',
          },
          cyan: {
            400: '#F89278',
            500: '#844377',
            600: '#6F3563',
          },
          amber: {
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706',
          },
          emerald: {
            500: '#10B981',
            600: '#059669',
          },
          rose: {
            500: '#F43F5E',
            600: '#E11D48',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
