import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { display: ['Arial Rounded MT Bold', 'Arial', 'sans-serif'] },
      boxShadow: { sticker: '5px 5px 0px #171717' },
      rotate: { '1': '1deg', '-1': '-1deg', '2': '2deg', '-2': '-2deg' }
    }
  },
  plugins: []
}
export default config
