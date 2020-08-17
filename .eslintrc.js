module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/strongly-recommended',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'vue/no-v-html': 0,
    'comma-dangle': ['error', 'always-multiline'],
    'arrow-parens': ['error', 'always'],
    "space-before-function-paren": ["error", "always"],
    semi: ["error", "always", { "omitLastInOneLineBlock": true}],
    'max-len': ['error', { 'code': 100, 'ignoreUrls': true }],
    'prefer-template': 'error',
    'operator-linebreak': ['error', 'before'],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
};
