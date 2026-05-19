import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Text
        ink: '#5B3A8A',       // deep purple (replaces black for body/headings)
        muted: '#B891D1',     // soft purple secondary

        // Surfaces
        bg: '#FFE6F4',        // page bg (soft pink)
        paper: '#FFFFFF',     // card surface

        // Semantic accents
        accent: '#FFB347',    // peach (status pills, hover hint)
        danger: '#FF4F8F',    // bright kawaii pink for deductions / -points
        healthy: '#6FB8FF',   // sky blue for partner / positive

        // Gradient endpoints
        pink: '#FF6FB5',
        purple: '#C77DFF',
        sky: '#6FB8FF',
        azure: '#7DC8FF'
      },
      backgroundImage: {
        'page-grad': 'linear-gradient(180deg, #FFE6F4 0%, #E0F4FF 100%)',
        'pink-grad': 'linear-gradient(135deg, #FF6FB5 0%, #C77DFF 100%)',
        'sky-grad': 'linear-gradient(135deg, #6FB8FF 0%, #7DC8FF 100%)',
        'peach-grad': 'linear-gradient(135deg, #FFB347 0%, #FF6FB5 100%)'
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif']
      },
      boxShadow: {
        // Pink "sticker" shadow (replaces black neo)
        neo: '3px 3px 0 #FFB6E6',
        'neo-lg': '5px 5px 0 #FFB6E6',
        'neo-sm': '2px 2px 0 #FFB6E6',
        // Variants
        'neo-blue': '3px 3px 0 #B4DCFF',
        'neo-purple': '3px 3px 0 #E6C7FF',
        // Glow
        glow: '0 8px 24px rgba(255,111,181,0.35)',
        'glow-blue': '0 8px 24px rgba(111,184,255,0.35)'
      },
      borderWidth: { 2.5: '2.5px' },
      borderRadius: { card: '18px', chip: '14px' }
    }
  },
  plugins: [animate]
};
export default config;
