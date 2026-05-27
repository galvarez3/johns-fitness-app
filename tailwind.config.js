/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Near-black neutral ramp (global reskin — overrides default slate)
        slate: {
          50:  '#FAFAFB',
          100: '#F1F1F4',
          200: '#E2E2E8',
          300: '#C7C7D0',
          400: '#9A9AA6',
          500: '#6E6E78',
          600: '#3A3A44',
          700: '#24242C',
          800: '#18181F',
          900: '#0E0E12',
          950: '#07070A',
        },
        // Electric cyan accent (global reskin — overrides default sky)
        sky: {
          300: '#A5F3F0',
          400: '#6FE9F2',
          500: '#22D3DB',
          600: '#12B6BE',
        },
        aqua: {
          DEFAULT: '#6FE9F2',
          light: '#A5F3F0',
          glow: '#7DF9FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Archivo Black"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(111,233,242,0.45)',
      },
      keyframes: {
        'bounce-in': {
          '0%':   { transform: 'translateY(-120%)', opacity: '0' },
          '60%':  { transform: 'translateY(8%)',    opacity: '1' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
