import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cerca: {
          babyblue: '#bbd6ff',
          babyblueLight: '#ddeeff',
          babypurple: '#c8b8f8',
          babypurpleLight: '#e8e0f8',
          primary: '#5a47b0',
          secondary: '#8878c4',
          text: '#3a2e6e',
          muted: '#9888d0',
          online: '#82c8a0',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Cormorant Garamond', 'serif'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
      },
    },
  },
  plugins: [],
}

export default config
