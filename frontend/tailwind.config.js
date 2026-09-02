/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Denim — campus-map blue, used for links/focus/brand. Not the generic SaaS blue.
        primary: {
          50: '#eef3f8',
          100: '#d8e3ee',
          200: '#b4cadf',
          300: '#86a9cb',
          400: '#5884b0',
          500: '#3a6996',
          600: '#2f5c8a',
          700: '#264a6e',
          800: '#1f3c59',
          900: '#1a3149',
          950: '#0f1d2c',
        },
        // Vacant — the "seat is free" green. Doubles as the app's positive color.
        success: {
          50: '#eaf6f0',
          100: '#cdebdd',
          200: '#9bd7bc',
          300: '#66be99',
          400: '#3aa47c',
          500: '#21875f',
          600: '#1e7a54',
          700: '#17603f',
          800: '#124a31',
          900: '#0e3a27',
        },
        // Filling — moderate occupancy. Ochre, not the cliché terracotta.
        warning: {
          50: '#fbf3e7',
          100: '#f6e4c4',
          200: '#edca8c',
          300: '#e2ac55',
          400: '#d2932f',
          500: '#c1791f',
          600: '#a8631a',
          700: '#855015',
          800: '#663f11',
          900: '#4f310d',
        },
        // Full — no seats left / errors.
        error: {
          50: '#fbeeec',
          100: '#f5d6d1',
          200: '#e9afa5',
          300: '#db8478',
          400: '#c85c4e',
          500: '#c1483a',
          600: '#a83a32',
          700: '#862e28',
          800: '#67241f',
          900: '#501c18',
        },
        // Ink — warm charcoal, replaces default cool gray. Doubles as the dark nav-rail surface at 900.
        neutral: {
          50: '#f9f8f6',
          100: '#f0eeea',
          200: '#e1ded7',
          300: '#c7c2b8',
          400: '#a29c8e',
          500: '#7a7466',
          600: '#5b564a',
          700: '#423e35',
          800: '#2a2722',
          900: '#1e1b17',
          950: '#131110',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
    },
  },
  plugins: [],
}