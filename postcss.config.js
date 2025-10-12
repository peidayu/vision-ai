/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [require("@tailwindcss/postcss"), require("autoprefixer")],
};

module.exports = config;
