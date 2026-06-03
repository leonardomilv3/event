import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces
        background: '#121415',
        surface: '#121415',
        'surface-dim': '#121415',
        'surface-bright': '#38393a',
        'surface-container-lowest': '#0c0e0f',
        'surface-container-low': '#1a1c1d',
        'surface-container': '#1e2021',
        'surface-container-high': '#282a2b',
        'surface-container-highest': '#333536',
        'surface-variant': '#333536',
        'surface-tint': '#6fdba9',
        // On-surface
        'on-surface': '#e2e2e3',
        'on-surface-variant': '#bdcac0',
        'on-background': '#e2e2e3',
        // Outlines
        outline: '#87948b',
        'outline-variant': '#3e4942',
        // Primary (Mint Green)
        primary: '#b3ffd7',
        'on-primary': '#003824',
        'primary-container': '#7be7b4',
        'on-primary-container': '#006846',
        'primary-fixed': '#8bf8c3',
        'primary-fixed-dim': '#6fdba9',
        'on-primary-fixed': '#002113',
        'on-primary-fixed-variant': '#005236',
        'inverse-primary': '#006c49',
        // Secondary (Live Red)
        secondary: '#ffb3b0',
        'on-secondary': '#68000f',
        'secondary-container': '#901822',
        'on-secondary-container': '#ff9e9b',
        'secondary-fixed': '#ffdad8',
        'secondary-fixed-dim': '#ffb3b0',
        'on-secondary-fixed': '#410006',
        'on-secondary-fixed-variant': '#8c1520',
        // Tertiary (Neutral)
        tertiary: '#eceff3',
        'on-tertiary': '#2d3134',
        'tertiary-container': '#d0d3d7',
        'on-tertiary-container': '#575b5e',
        'tertiary-fixed': '#e0e3e7',
        'tertiary-fixed-dim': '#c4c7cb',
        'on-tertiary-fixed': '#181c1f',
        'on-tertiary-fixed-variant': '#43474b',
        // Error
        error: '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        // Inverse
        'inverse-surface': '#e2e2e3',
        'inverse-on-surface': '#2f3132',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        'display-lg': ['"Playfair Display"', 'serif'],
        'display-lg-mobile': ['"Playfair Display"', 'serif'],
        'headline-lg': ['"Playfair Display"', 'serif'],
        'headline-lg-mobile': ['"Playfair Display"', 'serif'],
        'headline-md': ['"Playfair Display"', 'serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'label-md': ['Inter', 'sans-serif'],
        'label-caps': ['Inter', 'sans-serif'],
      },

      fontSize: {
        'display-lg': ['72px', { lineHeight: '80px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['48px', { lineHeight: '52px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['40px', { lineHeight: '48px', fontWeight: '600' }],
        'headline-lg-mobile': ['32px', { lineHeight: '38px', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.1em', fontWeight: '700' }],
      },

      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '1.5rem',
        full: '9999px',
      },

      spacing: {
        'stack-xs': '4px',
        'stack-sm': '12px',
        'stack-md': '24px',
        'stack-lg': '48px',
        'stack-xl': '80px',
        gutter: '24px',
        base: '8px',
        'margin-mobile': '20px',
        'margin-desktop': '64px',
        'container-max': '1440px',
      },

      maxWidth: {
        'container-max': '1440px',
      },

      backdropBlur: {
        glass: '20px',
      },

      boxShadow: {
        'mint-glow': '0 0 20px rgba(123, 231, 180, 0.3)',
        'mint-glow-strong': '0 0 30px rgba(123, 231, 180, 0.5)',
        'mint-glow-xl': '0 10px 40px rgba(123, 231, 180, 0.3)',
        'red-glow': '0 0 20px rgba(255, 107, 107, 0.3)',
        'nav-glow': '0 0 20px rgba(123, 231, 180, 0.1)',
      },

      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'pulse-red': 'pulse-red 2s infinite',
        breath: 'breath 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.6' },
          '100%': { transform: 'translate(-50%, -50%) scale(4)', opacity: '0' },
        },
        'pulse-red': {
          '0%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 0 0 rgba(255, 107, 107, 0.7)' },
          '70%': { transform: 'scale(1.05)', opacity: '1', boxShadow: '0 0 0 10px rgba(255, 107, 107, 0)' },
          '100%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 0 0 rgba(255, 107, 107, 0)' },
        },
        breath: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
