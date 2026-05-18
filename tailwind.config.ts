import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1F2937',
        bg: '#FEF3C7',
        accent: '#FBBF24',
        danger: '#DC2626',
        healthy: '#10B981',
        paper: '#FFFFFF',
        muted: '#6B7280'
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif']
      },
      boxShadow: {
        neo: '3px 3px 0 #1F2937',
        'neo-lg': '6px 6px 0 #1F2937',
        'neo-sm': '2px 2px 0 #1F2937'
      },
      borderWidth: { 2.5: '2.5px' },
      borderRadius: { card: '14px', chip: '10px' }
    }
  },
  plugins: []
};
export default config;
