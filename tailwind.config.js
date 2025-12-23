/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores do design system Adventure Labs
        primary: {
          red: '#DA0028',
          blue: '#042AA1',
        },
        background: {
          DEFAULT: '#0a1929',
          dark: '#0a1929', // Azul marinho muito escuro
          darker: '#071018',
        },
        // Cores do Google para gráficos
        google: {
          blue: '#4285F4',
          green: '#34A853',
          yellow: '#FBBC04',
          red: '#EA4335',
        }
      },
      backgroundImage: {
        'gradient-red': 'linear-gradient(135deg, #DA0028 0%, #FF1744 100%)',
        'gradient-blue': 'linear-gradient(135deg, #042AA1 0%, #1976D2 100%)',
        'gradient-combined': 'linear-gradient(135deg, #DA0028 0%, #042AA1 100%)',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(218, 0, 40, 0.5)',
        'glow-blue': '0 0 20px rgba(4, 42, 161, 0.5)',
        'glow-combined': '0 0 25px rgba(218, 0, 40, 0.4), 0 0 25px rgba(4, 42, 161, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

