/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      spacing: {
        // Strict 4-point grid system (0.25rem = 4px base unit)
        '0': '0',
        '0.5': '0.125rem',   // 2px
        '1': '0.25rem',      // 4px
        '1.5': '0.375rem',   // 6px
        '2': '0.5rem',       // 8px
        '2.5': '0.625rem',   // 10px
        '3': '0.75rem',      // 12px
        '3.5': '0.875rem',   // 14px
        '4': '1rem',         // 16px
        '5': '1.25rem',      // 20px
        '6': '1.5rem',       // 24px
        '7': '1.75rem',      // 28px
        '8': '2rem',         // 32px
        '9': '2.25rem',      // 36px
        '10': '2.5rem',      // 40px
        '11': '2.75rem',     // 44px
        '12': '3rem',        // 48px
        '14': '3.5rem',      // 56px
        '16': '4rem',        // 64px
        '20': '5rem',        // 80px
        '24': '6rem',        // 96px
        '28': '7rem',        // 112px
        '32': '8rem',        // 128px
        '36': '9rem',        // 144px
        '40': '10rem',       // 160px
        '44': '11rem',       // 176px
        '48': '12rem',       // 192px
        '52': '13rem',       // 208px
        '56': '14rem',       // 224px
        '60': '15rem',       // 240px
        '64': '16rem',       // 256px
        '72': '18rem',       // 288px
        '80': '20rem',       // 320px
        '96': '24rem',       // 384px
      },
      fontSize: {
        // Responsive typography with 4-point line heights
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px/16px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px/20px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px/24px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px/28px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px/28px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px/32px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px/36px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px/40px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px/48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px/60px
        '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px/72px
        '8xl': ['6rem', { lineHeight: '1' }],           // 96px/96px
        '9xl': ['8rem', { lineHeight: '1' }],           // 144px/144px
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'strong': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
