/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        instagram: '#E1306C',
        tiktok: '#010101',
        facebook: '#1877F2',
        linkedin: '#0A66C2',
      }
    }
  },
  plugins: []
}
