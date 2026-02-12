/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: '#000000',
          card: '#141414',
          elevated: '#1c1c1e',
          input: '#1c1c1e',
        },
        tesla: {
          red: '#e31937',
          blue: '#3b82f6',
          green: '#30d158',
          orange: '#ff9f0a',
          purple: '#bf5af2',
        },
        dim: {
          blue: 'rgba(59, 130, 246, 0.15)',
          green: 'rgba(48, 209, 88, 0.15)',
          red: 'rgba(255, 69, 58, 0.15)',
          orange: 'rgba(255, 159, 10, 0.15)',
          purple: 'rgba(191, 90, 242, 0.15)',
        },
        txt: {
          primary: '#f5f5f5',
          secondary: '#8e8e93',
          tertiary: '#636366',
        },
        edge: {
          subtle: '#1c1c1e',
          default: '#2c2c2e',
          strong: '#3a3a3c',
        },
      },
    },
  },
  plugins: [],
};
