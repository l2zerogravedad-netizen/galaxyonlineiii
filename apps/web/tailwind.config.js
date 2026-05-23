/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        galaxy: {
          dark: '#0f172a',
          darker: '#020617',
          primary: '#3b82f6',
          secondary: '#6366f1',
          accent: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}
