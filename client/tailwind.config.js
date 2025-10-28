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
        // Match the exact reference design values (design2 copy.html)
        '0': '0',
        '0.5': '0.125rem',   // 2px
        '1': '0.25rem',      // 4px
        '1.5': '0.375rem',   // 6px  
        '2': '0.5rem',       // 8px
        '2.5': '0.625rem',   // 10px (reference: 0.625rem)
        '3': '0.75rem',      // 12px
        '3.5': '0.875rem',   // 14px (reference: 0.875rem - key grid gap)
        '4': '1rem',         // 16px (reference: 1rem - stat card padding)
        '5': '1.25rem',      // 20px (reference: 1.25rem - section margins)
        '6': '1.5rem',       // 24px (reference: 1.5rem - sidebar padding)
        // Keep smaller increments for precise control
        '7': '1.75rem',      // 28px
        '8': '2rem',         // 32px
        '10': '2.5rem',      // 40px
        '12': '3rem',        // 48px
        '16': '4rem',        // 64px
        '20': '5rem',        // 80px
        '24': '6rem',        // 96px
      },
      fontSize: {
        // Match exact reference design font sizes (design2 copy.html)
        'xs': ['0.625rem', { lineHeight: '1rem' }],      // 10px/16px (reference: 0.625rem)
        'sm': ['0.75rem', { lineHeight: '1rem' }],       // 12px/16px (reference: 0.75rem - stat-change)
        'base': ['0.875rem', { lineHeight: '1.25rem' }], // 14px/20px (reference: 0.875rem - most text)
        'lg': ['1rem', { lineHeight: '1.5rem' }],        // 16px/24px (reference: 1rem)
        'xl': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px/28px (reference: 1.125rem)
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px/28px (reference: 1.25rem - stat-value)
        '3xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px/32px (reference: 1.5rem - dashboard title)
        '4xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px/36px
        '5xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px/40px
        '6xl': ['3rem', { lineHeight: '1' }],            // 48px/48px
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
