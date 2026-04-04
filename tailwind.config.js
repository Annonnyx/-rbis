/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        'orbis-bg': '#0a0a0f',
        'orbis-violet': '#7c3aed',
        'orbis-violet-hover': '#6d28d9',
        'orbis-violet-light': '#a78bfa',
        'orbis-white': '#ffffff',
        'orbis-white-50': 'rgba(255, 255, 255, 0.5)',
        'orbis-white-10': 'rgba(255, 255, 255, 0.1)',
        'orbis-white-8': 'rgba(255, 255, 255, 0.08)',
        'orbis-white-5': 'rgba(255, 255, 255, 0.05)',
        'orbis-success': '#22c55e',
        'orbis-warning': '#f59e0b',
        'orbis-error': '#ef4444',
        'orbis-info': '#3b82f6',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.2s ease-out',
        'modal-overlay': 'modal-overlay-in 0.2s ease-out',
        'modal-content': 'modal-content-in 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.5)',
          },
        },
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'modal-overlay-in': {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        'modal-content-in': {
          from: {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'shimmer': {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
      },
    },
  },
  plugins: [],
}
