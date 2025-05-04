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
        custom_oceanBlue: 'rgb(163, 199, 210)',      // hidro
        custom_pinkBlush: 'rgb(235, 191, 216)',      // c1
        custom_softPink: 'rgb(251, 201, 229)',       // c2
        custom_skyAqua: 'rgb(191, 234, 236)',        // r8
        custom_limeGreen: 'rgb(162, 211, 77)',       // r9
        custom_skyBlue: 'rgb(91, 194, 231)',         // c3 - c12
        custom_neonYellow: 'rgb(206, 220, 0)',       // c13
        custom_lavender: 'rgb(209, 162, 203)',       // c14
        custom_silverGray: 'rgb(181, 185, 186)',     // c15
        custom_sunsetOrange: 'rgb(240, 179, 35)',    // c16
        custom_peach: 'rgb(234, 179, 127)',          // c17
        custom_goldenYellow: 'rgb(234, 218, 36)',    // c18
        g1_label: "rgb(145, 0, 72)",
        g2_label: "rgb(227, 28, 121)",
        gmetal_label: "rgb(22, 111, 185)",
        g13_label: "rgb(83, 115, 0)",
        g14_label: "rgb(131, 49, 119)",
        g15_label: "rgb(80, 87, 89)",
        g16_label: "rgb(183, 42, 0)",
        g17_label: "rgb(190, 77, 0)",
        g18_label: "rgb(157, 109, 0)",
        glan_label: "rgb(0, 140, 149)",
        gact_label: "rgb(69, 138, 5)",
        h_label: "rgb(61, 105, 124)",
      },
      spacing: {
        '5p': '5%',
        '10p': '10%',
        '15p': '15%',
        '20p': '20%',
        '25p': '25%',
        '30p': '30%',
        '35p': '35%',
        '40p': '40%',
        '45p': '45%',
        '50p': '50%',
        '55p': '55%',
        '60p': '60%',
        '65p': '65%',
        '70p': '70%',
        '75p': '75%',
        '80p': '80%',
        '85p': '85%',
        '90p': '90%',
        '95p': '95%',
      }
    },
  },
  plugins: [],
  corePlugins: require('tailwind-rn/unsupported-core-plugins'),
}
