import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1',
          dark: '#4338ca',
          light: '#a5b4fc',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
