import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Text (Apple label semantics)
        ink: '#1C1C1E',     // primary label
        muted: '#8E8E93',   // secondary label

        // Surfaces
        bg: '#FFFFFF',      // page background (pure white)
        paper: '#F2F2F7',   // secondary surface (cards, chips)

        // Semantic accents (Apple system colors)
        accent: '#34C759',  // primary brand · positive
        healthy: '#34C759', // alias for positive context (bonus / good news)
        danger: '#FF3B30',  // alarms · negative
        warn: '#FF9500',    // mid-tier warning

        // Hairline border
        line: '#E5E5EA'
      },
      fontFamily: {
        sans: ['-apple-system', 'system-ui', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif']
      },
      borderRadius: {
        card: '16px',
        chip: '12px'
      }
    }
  },
  plugins: [animate]
};
export default config;
