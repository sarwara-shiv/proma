/** @type {import('tailwindcss').Config} */
import customButtonPlugin from './src/assets/styles/tailwind-custom-button';
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#3aafa9",
        "primary-dark": "#2b7a78",
        "primary-light": "#def2f1",
        "dark": "#17252a",
        "medium": "#9f9f9f",
        "light": "#afafaf", 
      }
    },
  },
  plugins: [
    customButtonPlugin
  ],
}

