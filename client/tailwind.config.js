/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vs: {
          deep: 'var(--vs-deep)',
          teal: 'var(--vs-teal)',
          blue: 'var(--vs-blue)',
          gold: 'var(--vs-gold)',
          feather: 'var(--vs-feather)',
          emerald: 'var(--vs-emerald)',
          rose: 'var(--vs-rose)',
          surface: 'var(--vs-surface)',
          text: 'var(--vs-text)',
          muted: 'var(--vs-muted)',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px var(--vs-teal)' },
          '50%': { boxShadow: '0 0 20px var(--vs-feather)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'feather-burst': {
          '0%': { opacity: '1', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '0.8', transform: 'scale(1.2) rotate(180deg)' },
          '100%': { opacity: '0', transform: 'scale(2) rotate(360deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        'feather-burst': 'feather-burst 0.8s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
