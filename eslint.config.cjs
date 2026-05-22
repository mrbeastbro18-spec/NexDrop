const nextConfigs = require('eslint-config-next');

module.exports = [
  {
    ignores: ['node_modules/**', '.next/**', 'coverage/**', '.git/**', 'dist/**']
  },
  ...nextConfigs
];
