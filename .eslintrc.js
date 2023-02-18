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
    parser: '@babel/eslint-parser',
  },
  rules: {
    'vue/no-v-html': 0,
    'comma-dangle': ['error', 'always-multiline'],
    'arrow-parens': ['error', 'always'],
    'space-before-function-paren': ['error', 'always'],
    semi: ['error', 'always', { omitLastInOneLineBlock: true }],
    'max-len': ['warn', { code: 100, ignoreUrls: true }],
    'no-underscore-dangle': ['off'],
    'prefer-template': 'error',
    'operator-linebreak': ['error', 'before'],
    'no-warning-comments': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'vuejs-accessibility/click-events-have-key-events': 0,
    'vuejs-accessibility/alt-text': 0,
    'vuejs-accessibility/mouse-events-have-key-events': 0,
    'vuejs-accessibility/no-autofocus': 0,
    'vue/multi-word-component-names': 0,
    'vuejs-accessibility/media-has-caption': 0,
  },
};
