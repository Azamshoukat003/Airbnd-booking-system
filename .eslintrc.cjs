module.exports = {
  root: true,
  env: { node: true, browser: true, es2022: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
  rules: {
    'import/no-unresolved': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  }
};
