/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        clay: '#f4f1ea',
        ocean: '#0b7285',
        primary: '#ff385c',
        secondary: '#222222'
      },
      maxWidth: {
        '8xl': '88rem'
      }
    }
  },
  plugins: []
};
