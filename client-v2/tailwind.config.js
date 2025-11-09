/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind CSS v4 uses @source in CSS for content paths
  // This config is minimal - main configuration is in src/index.css using @theme
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Theme is primarily configured via @theme in index.css
    // This allows for CSS-first configuration approach
    extend: {},
  },
  plugins: [],
}
