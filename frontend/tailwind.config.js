/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f0f9f1',
          100: '#dcf0df',
          200: '#bbe1c2',
          300: '#8ec999',
          400: '#5eaa6d',
          500: '#3a8e4b',
          600: '#2e7d32', // Canonical primary brand green
          700: '#1b5e20', // Deep forest green
          800: '#154e19',
          900: '#0f3812',
          950: '#071f09',
        },
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d', // Deep forest green primary
          800: '#166534', // Deepest forest green
          900: '#14532d',
          950: '#052e16',
        },
        harvest: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        sand: {
          50: '#fdfbf7',
          100: '#fbf2e3',
          200: '#f5e1c4',
          300: '#ecc899',
          400: '#dfab68',
          500: '#cb8939',
          600: '#b06a28',
          700: '#8c4d20',
          800: '#6f3c1d',
          900: '#573019',
        },
        earth: {
          50: '#faf8f5', // Warm neutral background
          100: '#f4ede4',
          200: '#e8dcce',
          300: '#d5c2ac',
          400: '#8e6c4e', // Darkened for readable placeholders and muted text
          500: '#755437',
          600: '#5e4129',
          700: '#4a321e',
          800: '#362314',
          900: '#1e130a', // Deep charcoal/soil brown for maximum text contrast
        }
      },
      fontFamily: {
        sans: [
          '"Noto Sans Kannada"',
          '"Nirmala UI"',
          '"Kannada Sangam MN"',
          '"Kannada MN"',
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif'
        ],
        kannada: [
          '"Noto Sans Kannada"',
          '"Nirmala UI"',
          '"Kannada Sangam MN"',
          '"Kannada MN"',
          'system-ui',
          'sans-serif'
        ]
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(27, 94, 32, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'lifted': '0 8px 24px -4px rgba(27, 94, 32, 0.12), 0 3px 8px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
