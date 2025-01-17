module.exports = {
  content: [
    "./app/*.tsx",
    "./app/**/*.{tsx,ts}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        activeIndexBlue: {
          500: '#007BFF', // Custom blue
        },
        inactiveIndexGray: {
          400: '#B0B0B0', // Custom gray
        },
      },
    },
  },
  plugins: [],
  corePlugins: require('tailwind-rn/unsupported-core-plugins'),
}
