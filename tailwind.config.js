/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
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
