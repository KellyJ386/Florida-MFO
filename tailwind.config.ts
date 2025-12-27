import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Seattle Seahawks Colors
        seahawks: {
          navy: '#002244',
          'navy-light': '#0A3A5F',
          'navy-dark': '#001933',
          green: '#69BE28',
          'green-light': '#7FD93D',
          'green-dark': '#4FA010',
          grey: '#A5ACAF',
          'grey-light': '#C5CACF',
          'grey-dark': '#85898C',
        },
        // Ice depth status colors
        ice: {
          ideal: '#22c55e',
          warning: '#eab308',
          critical: '#ef4444',
        },
        // Theme-aware colors
        primary: {
          DEFAULT: '#002244',
          light: '#0A3A5F',
          dark: '#001933',
        },
        accent: {
          DEFAULT: '#69BE28',
          light: '#7FD93D',
          dark: '#4FA010',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'seahawks-gradient': 'linear-gradient(135deg, #002244 0%, #0A3A5F 100%)',
        'seahawks-gradient-reverse': 'linear-gradient(135deg, #69BE28 0%, #4FA010 100%)',
      },
      boxShadow: {
        'seahawks': '0 4px 14px 0 rgba(0, 34, 68, 0.39)',
        'seahawks-lg': '0 10px 30px 0 rgba(0, 34, 68, 0.5)',
        'green': '0 4px 14px 0 rgba(105, 190, 40, 0.39)',
        'green-lg': '0 10px 30px 0 rgba(105, 190, 40, 0.5)',
      },
    },
  },
  plugins: [],
}
export default config
