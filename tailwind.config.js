/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // slate-900
        card: '#1e293b', // slate-800
        primary: '#1d4ed8', // deep blue
        success: '#16a34a', // green
        pending: '#d97706', // amber
        alert: '#dc2626', // red
        text: '#f8fafc', // slate-50
        textMuted: '#94a3b8', // slate-400
      }
    },
  },
  plugins: [],
}
