/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#1f1f1f',
        nm: '#cccccc',
        li: '#6d7681',
        ac: '#6a9956',
        muted: '#8F8E8E',
        primary: '#F25859',
      },
      gridTemplateColumns: {
        'custom-layout': '1fr 2fr',
      },
    },
  },
  plugins: [],
}