/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cinzel"', 'Syne', 'serif'],
        sans: ['"Sora"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: '#111417',
        'surface-lowest': '#080509',
        'surface-low': '#150a12',
        'surface-bright': '#37393d',
        crimson: {
          DEFAULT: '#e11d48',
          glow: 'rgba(225, 29, 72, 0.28)',
          deep: '#881337',
          burgundy: '#9f1239',
        },
        champagne: {
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        casino: {
          dark: '#08090D',
          table: '#0E1118',
          surface: '#141824',
          card: '#1A2030',
          'card-hover': '#22293D',
          border: '#283248',
          'border-light': '#384562',
        },
        gold: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          dark: '#B45309',
        },
      },
      boxShadow: {
        'tactile': '0 4px 0 0 rgba(0, 0, 0, 0.5)',
        'tactile-pressed': '0 1px 0 0 rgba(0, 0, 0, 0.5)',
        'gold-glow': '0 0 24px -4px rgba(245, 158, 11, 0.3)',
        'chip': '0 6px 12px -2px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
      },
    },
  },
  plugins: [],
};
