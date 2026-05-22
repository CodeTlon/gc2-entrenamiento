import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // GC2 blue scale (from SCSS _variables.scss)
        blue: {
          900: '#0A1628',
          800: '#0D2247',
          700: '#102E66',
          600: '#1A4494',
          500: '#2563EB',
          400: '#3B82F6',
          300: '#60A5FA',
          200: '#93C5FD',
          100: '#DBEAFE',
        },
        accent: '#38BDF8',
        success: '#25D366',
        danger: '#ef4444',
      },
      fontFamily: {
        heading: ['var(--font-barlow-condensed)', 'sans-serif'],
        body: ['var(--font-barlow)', 'sans-serif'],
      },
      maxWidth: {
        container: '1200px',
      },
      spacing: {
        section: '120px',
        'gap-sm': '12px',
        'gap-md': '20px',
        'gap-lg': '40px',
        'gap-xl': '64px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '100px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(10,22,40,0.1)',
        md: '0 4px 16px rgba(10,22,40,0.15)',
        lg: '0 12px 40px rgba(10,22,40,0.25)',
        xl: '0 24px 80px rgba(0,0,0,0.5)',
        accent: '0 12px 40px rgba(37,99,235,0.4)',
        wa: '0 4px 20px rgba(37,211,102,0.4)',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2563EB, #38BDF8)',
        'gradient-hero': 'linear-gradient(to bottom, rgba(10,22,40,0.5) 0%, rgba(10,22,40,0.8) 100%)',
        'gradient-card': 'linear-gradient(135deg, #1A4494, #2563EB)',
        'gradient-ig': 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        rotateSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
