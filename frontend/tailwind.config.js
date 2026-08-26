/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        niu: {
          green: {
            50: '#e6f5ec',
            100: '#c3e8d2',
            200: '#94d3ad',
            300: '#5ebb82',
            400: '#2fa05c',
            500: '#006837', // NIU Primary Green
            600: '#00542c',
            700: '#004222',
            800: '#00331a',
            900: '#002210',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#facc15',
            500: '#eab308', // NIU Warm Gold
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
          },
          dark: {
            900: '#080c0a',
            800: '#0f1713',
            700: '#16221c',
          }
        },
        role: {
          admin: {
            DEFAULT: '#006837',
            light: '#e6f5ec',
            dark: '#004222'
          },
          student: {
            DEFAULT: '#2563eb',
            light: '#dbeafe',
            dark: '#1d4ed8'
          },
          faculty: {
            DEFAULT: '#0d9488',
            light: '#ccfbf1',
            dark: '#0f766e'
          }
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)'
      }
    },
  },
  plugins: [],
}
