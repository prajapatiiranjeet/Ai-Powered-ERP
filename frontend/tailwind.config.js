/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        niu: {
          green: {
            50: '#f0f4ec',
            100: '#dce8d3',
            200: '#b9d09f',
            300: '#94b877',
            400: '#6f934f',
            500: '#486c2f',
            600: '#3d5b29',
            700: '#334b24',
            800: '#293d20',
            900: '#1f301a',
          },
          gold: {
            50: '#fffbea',
            100: '#f8efbd',
            200: '#f1e5a1',
            300: '#ead88a',
            400: '#e0c966',
            500: '#f1e5a1',
            600: '#d9c77e',
            700: '#b39b50',
            800: '#8b773a',
          },
          dark: {
            900: '#080c0a',
            800: '#0f1713',
            700: '#16221c',
          }
        },
        role: {
          admin: {
            DEFAULT: '#8b2626',
            light: '#f8eaea',
            dark: '#681d1d'
          },
          student: {
            DEFAULT: '#ef6905',
            light: '#fff0e5',
            dark: '#bd4e04'
          },
          faculty: {
            DEFAULT: '#486c2f',
            light: '#f0f4ec',
            dark: '#334b24'
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
