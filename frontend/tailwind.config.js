/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        fontFamily: {
            satoshi: ['Satoshi', 'sans-serif'],
            inter: ['Inter', 'sans-serif'],
        },
        keyframes: {
          silverGlow: {
            '0%, 100%': { 
              boxShadow: '0 0 0 0 rgba(192, 192, 192, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.1)'
            },
            '50%': { 
              boxShadow: '0 0 8px 2px rgba(192, 192, 192, 0.6), inset 0 2px 4px rgba(0, 0, 0, 0.1)'
            }
          },
          silverWobble: {
            '0%, 100%': { transform: 'rotate(0deg)' },
            '25%': { transform: 'rotate(1deg)' },
            '75%': { transform: 'rotate(-1deg)' }
          },
          shimmer: {
            '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)' },
            '50%': { transform: 'translateX(100%) translateY(100%) rotate(45deg)' },
            '100%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)' }
          },
          silverBreath: {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' }
          },
          silverBounce: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-2px)' }
          }
        },
        animation: {
          'silver-glow': 'silverGlow 3s ease-in-out infinite',
          'silver-wobble': 'silverWobble 4s ease-in-out infinite',
          'silver-shimmer': 'shimmer 3s ease-in-out infinite',
          'silver-breath': 'silverBreath 2.5s ease-in-out infinite',
          'silver-bounce': 'silverBounce 6s ease-in-out infinite'
        }
    },
    borderRadius: {
      'none': '0px',
      'sm': '0.125rem',
      DEFAULT: '0.25rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'xl': '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      'full': '9999px',
      'silver-egg': '50% 50% 50% 50% / 60% 60% 40% 40%'
    },
    screens: {
      xlg: '1500px',
      lg: '1050px'
    }
  },
  plugins: [],
}