// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    prependData: `@import "@styles/_variables.scss";`,
  },
  reactStrictMode: false,
};
