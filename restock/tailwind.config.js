/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./<custom-folder>/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary portfolio colors (dark grey and white)
        primary: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#6C757D', // Main industrial grey
          600: '#495057',
          700: '#343A40',
          800: '#212529', // Dark charcoal grey (portfolio exterior)
          900: '#1A1D20',
        },
        // Paper and background colors (white and warm whites)
        paper: {
          50: '#FFFFFF', // Pure white (paper)
          100: '#FEFEFE',
          200: '#FDFDFD',
          300: '#FCFCFC',
          400: '#FBFBFB',
          500: '#FAFAFA',
          600: '#F9F9F9',
          700: '#F8F8F8',
          800: '#F7F7F7',
          900: '#F6F6F6',
        },
        // Semantic button colors
        buttons: {
          navigation: '#22C55E', // Green for moving to different screens
          quickAction: '#22C55E', // Green for quick actions
          auth: '#22C55E', // Green for authentication buttons
          edit: '#F97316', // Deep orange for edit actions
          signOut: '#EF4444', // Red for sign out
          primary: '#6C757D', // Industrial grey for primary actions
          secondary: '#ADB5BD', // Light grey for secondary actions
        },
        // Content text colors
        text: {
          important: '#3B82F6', // Blue for important information
          primary: '#000000', // Black for regular content
          secondary: '#6C757D', // Grey for secondary text
          muted: '#ADB5BD', // Light grey for muted text
        },
        // Status colors (muted and professional)
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        // Accent colors (from portfolio sticky notes)
        accent: {
          yellow: '#FCD34D',
          orange: '#F97316',
          pink: '#EC4899',
          green: '#22C55E',
          blue: '#3B82F6',
          red: '#EF4444',
        }
      },
      fontFamily: {
        'sans': ['System', 'sans-serif'],
        'mono': ['SpaceMono-Regular', 'monospace'],
        'satoshi': ['Satoshi-Regular', 'sans-serif'],
        'satoshi-black': ['Satoshi-Black', 'sans-serif'],
        'satoshi-bold': ['Satoshi-Bold', 'sans-serif'],
        'satoshi-medium': ['Satoshi-Medium', 'sans-serif'],
        'satoshi-light': ['Satoshi-Light', 'sans-serif'],
        'satoshi-thin': ['Satoshi-Thin', 'sans-serif'],
        'satoshi-italic': ['Satoshi-Italic', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 10px 20px -2px rgba(0, 0, 0, 0.03)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.12), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        'xl': '0 20px 50px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      }
    },
  },
  plugins: [],
}

