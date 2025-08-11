module.exports = {
  content: [
    './app/views/**/*.{erb,html}',
    './app/assets/javascripts/**/*.{html,erb}',
    './app/assets/javascripts/Templates/**/*.{html,erb}',
    './app/assets/partials/**/*.{js,erb}',
    './app/assets/stylesheets/**/*.{css,scss}',
    './app/helpers/**/*.rb'
  ],
  safelist: [
    // Garantir que ces classes sont toujours incluses
    'font-display',
    'bg-white/95',
    'backdrop-blur-sm',
    'safe-top',
    'safe-bottom',
    'btn-icon',
    'translate-x-0',
    '-translate-x-full',
    // Classes dynamiques AngularJS
    {
      pattern: /^(bg|text|border|hover|focus)-(primary|banana|plantain)-(50|100|200|300|400|500|600|700|800|900)$/
    },
    {
      pattern: /^(w|h|p|m|space)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64|72|80|96)$/
    }
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        banana: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        },
        plantain: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314'
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
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

