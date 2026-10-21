import type { Config } from 'tailwindcss';

// Colors resolve to CSS variables defined in src/styles/tokens.css
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    screens: { sm: '480px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1440px' },
    extend: {
      colors: {
        primary: { DEFAULT: token('primary'), hover: token('primary-hover'), soft: token('primary-soft'), fg: token('on-primary') },
        secondary: token('secondary'),
        accent: { DEFAULT: token('accent'), soft: token('accent-soft') },
        bg: token('bg'),
        surface: { DEFAULT: token('surface'), muted: token('surface-muted') },
        fg: { DEFAULT: token('fg'), muted: token('fg-muted'), subtle: token('fg-subtle') },
        border: { DEFAULT: token('border'), strong: token('border-strong') },
        danger: token('danger'),
        warning: token('warning'),
        success: token('success'),
      },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.875rem', { lineHeight: '1.375rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.625rem' }],
        xl: ['1.375rem', { lineHeight: '1.875rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '-0.015em' }],
        '3xl': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em' }],
        '4xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.025em' }],
      },
      borderRadius: { sm: '6px', DEFAULT: '10px', md: '12px', lg: '16px', xl: '24px' },
      boxShadow: {
        1: '0 1px 2px rgb(24 36 29 / 0.06), 0 1px 1px rgb(24 36 29 / 0.04)',
        2: '0 4px 12px rgb(24 36 29 / 0.08), 0 1px 3px rgb(24 36 29 / 0.06)',
        3: '0 12px 32px rgb(24 36 29 / 0.14)',
      },
      spacing: { 4.5: '1.125rem', 'safe-b': 'env(safe-area-inset-bottom)', 'safe-t': 'env(safe-area-inset-top)' },
      transitionTimingFunction: { out: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  plugins: [],
} satisfies Config;
