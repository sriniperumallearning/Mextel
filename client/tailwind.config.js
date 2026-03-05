/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A1F44",
        accent: {
          DEFAULT: "#00AAFF",
          hover: "#0090DD",
          teal: "#00E5CC",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        bg: "#F0F4FA",
        surface: "#FFFFFF",
        text: "#1A1A2E",
        muted: "#6B7280",
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 170, 255, 0.08)',
        'card-hover': '0 8px 32px rgba(0, 170, 255, 0.15)',
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
        'pill': '50px',
      }
    },
  },
  plugins: [],
}
