/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        slate: '#334155',
        mist: '#f8fafc',
        ember: '#f97316',
        sea: '#0ea5e9',
        forest: '#166534',
        signal: '#0d9488',
      },
      boxShadow: {
        panel: '0 24px 80px rgba(15, 23, 42, 0.12)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
