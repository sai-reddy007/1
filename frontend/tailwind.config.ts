import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyberBg: '#070b16',
        cyberCard: '#101a2b',
        neon: '#00f5d4',
        neonPurple: '#7c4dff',
      },
    },
  },
  plugins: [],
};

export default config;
