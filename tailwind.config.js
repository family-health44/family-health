// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // App background
        background: '#F7F5F0',

        // Person colour palette (index 0–4)
        // Green
        'person-green-bg': '#E6F0EC',
        'person-green-border': '#C0D8CA',
        'person-green-text': '#1A4D35',
        'person-green-dot': '#2A6049',

        // Blue
        'person-blue-bg': '#E8EFF8',
        'person-blue-border': '#C0CFDF',
        'person-blue-text': '#1A3A6B',
        'person-blue-dot': '#2C5282',

        // Red
        'person-red-bg': '#F5E8EB',
        'person-red-border': '#E0BDC4',
        'person-red-text': '#7A2030',
        'person-red-dot': '#9B3A4A',

        // Purple
        'person-purple-bg': '#EEE8F7',
        'person-purple-border': '#D4C4E8',
        'person-purple-text': '#3D2070',
        'person-purple-dot': '#5B3A8E',

        // Amber
        'person-amber-bg': '#F5EBE0',
        'person-amber-border': '#DEBFAA',
        'person-amber-text': '#7A3A10',
        'person-amber-dot': '#B56B2A',
      },
      fontFamily: {
        // Will be extended when custom fonts are added
      },
    },
  },
  plugins: [],
};
