module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.html.erb',
    './app/**/*.rb',
    './app/javascript/**/*.{js,ts,jsx,tsx}',
    './app/views/**/*.html.erb',
    './frontend/src/**/*.{js,ts,jsx,tsx}',
    './frontend/index.html'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f8f4',
          100: '#daf0e6',
          200: '#b7e1cc',
          300: '#8fcfb0',
          400: '#55b987',
          500: '#1f9c5f',
          600: '#187a4b',
          700: '#125e3a',
          800: '#0e4a2e',
          900: '#0b3a24',
        },
        accent: {
          100: '#fff7e6',
          300: '#ffd27a',
          500: '#f0b323',
          700: '#b57d12'
        },
        // Couleurs sémantiques selon le design system
        ink: '#0f172a',
        muted: '#475569',
        line: '#e2e8f0',
        surface: '#f8fafc',
        // États
        success: '#16a34a',
        warning: '#f59e0b',
        error: '#dc2626',
        info: '#2563eb'
      },
      boxShadow: {
        card: '0 2px 8px rgba(2,6,23,.06)',
        'card-hover': '0 8px 24px rgba(2,6,23,.12)',
        elev: '0 8px 24px rgba(2,6,23,.10)',
        pop: '0 12px 32px rgba(2,6,23,.16)',
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '20px',
        pill: '999px'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial']
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleUp: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ]
}

