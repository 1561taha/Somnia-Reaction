/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        game: {
          red: '#ef4444',
          blue: '#3b82f6',
          green: '#10b981',
          yellow: '#f59e0b',
          purple: '#8b5cf6',
          pink: '#ec4899',
          orange: '#f97316',
          cyan: '#06b6d4',
        }
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'explosion': 'explosion 0.6s ease-out',
        'chain-reaction': 'chain-reaction 0.8s ease-out',
        'orb-float': 'orb-float 2s ease-in-out infinite',
      },
      keyframes: {
        explosion: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.8' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'chain-reaction': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '25%': { transform: 'scale(1.2)', opacity: '0.9' },
          '50%': { transform: 'scale(1.4)', opacity: '0.7' },
          '75%': { transform: 'scale(1.6)', opacity: '0.5' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'orb-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      fontFamily: {
        'game': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 