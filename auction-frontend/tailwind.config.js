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
        'primary-main': '#1a1a1a',
        'primary-light': '#333333',
        'primary-dark': '#000000',
        
        'secondary-main': '#f5f5f5',
        'secondary-light': '#fafafa',
        'secondary-dark': '#e0e0e0',
        
        'accent-main': '#8B0000',
        'accent-light': '#A52A2A',
        'accent-dark': '#660000',
        'accent-hover': '#6B0000',
        
        'background-primary': '#ffffff',
        'background-secondary': '#fafafa',
        'background-tertiary': '#f5f5f5',
        
        'text-primary': '#1a1a1a',
        'text-secondary': '#525252',
        'text-tertiary': '#737373',
        'text-inverse': '#ffffff',
        'text-accent': '#8B0000',
        
        'border-light': '#e5e5e5',
        'border-medium': '#d4d4d4',
        'border-dark': '#a3a3a3',
        
        'status-success': '#059669',
        'status-warning': '#d97706',
        'status-error': '#dc2626',
        'status-info': '#0284c7',
      },
      fontFamily: {
        'primary': ['Inter', 'sans-serif'],
        'secondary': ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'button': '0 2px 8px rgba(139, 0, 0, 0.2)',
        'button-hover': '0 8px 16px rgba(139, 0, 0, 0.3)',
        'input-focus': '0 0 0 3px rgba(139, 0, 0, 0.1)',
        'input-error': '0 0 0 3px rgba(220, 38, 38, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            transform: 'translateY(20px)',
            opacity: '0',
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        scaleIn: {
          '0%': { 
            transform: 'scale(0.95)',
            opacity: '0',
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}
