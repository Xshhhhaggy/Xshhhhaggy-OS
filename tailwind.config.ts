/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xdark: '#0A0D12',
        xsurface: '#1E232B',
        xcard: '#2A2F3A',
        xlime: '#B7FF00',
        xcyan: '#00D5FF',
        xred: '#C0392B',
        xmuted: '#9CA3AF',
      }
    },
  },
  plugins: [],
}
