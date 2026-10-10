/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#F9F7F2',
          card: '#FFFFFF',
          subtle: '#F2EFE9',
          muted: '#EAE6DC',
        },
        charcoal: {
          DEFAULT: '#1C1917',
          light: '#2E2A27',
          muted: '#57534E',
          soft: '#78716C',
        },
        copper: {
          DEFAULT: '#C25E2E',
          hover: '#A94F25',
          light: '#F8EDE7',
          border: '#E8B69E',
          dark: '#8D3E1A',
        },
        olive: {
          DEFAULT: '#5F6F52',
          hover: '#4E5C43',
          light: '#EEF2EC',
          border: '#BDCCB4',
          dark: '#3D4934',
        },
        stoneBorder: {
          DEFAULT: '#E5E0D6',
          light: '#EFECE6',
          dark: '#D1CABE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(28, 25, 23, 0.05), 0 1px 2px -1px rgba(28, 25, 23, 0.03)',
        hover: '0 4px 6px -1px rgba(28, 25, 23, 0.08), 0 2px 4px -2px rgba(28, 25, 23, 0.05)',
        editorial: '0 10px 15px -3px rgba(28, 25, 23, 0.06), 0 4px 6px -4px rgba(28, 25, 23, 0.04)',
      }
    },
  },
  plugins: [],
}
