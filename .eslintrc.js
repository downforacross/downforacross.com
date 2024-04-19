module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb-typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:storybook/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    project: ['tsconfig.json', 'server/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['react', '@typescript-eslint', 'import'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    // disabled as we likely do not want it
    'no-return-await': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    // disabled as none of the current code follows this pattern.
    'import/extensions': 'off',
    'react/jsx-filename-extension': 'off',
    'react/button-has-type': 'off',
    'react/sort-comp': 'off',
    'import/prefer-default-export': 'off',
    'react/destructuring-assignment': 'off',

    // Used too much in existing code to fix, but new code can follow it
    'class-methods-use-this': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/mouse-events-have-key-events': 'warn',
    '@typescript-eslint/no-shadow': 'warn',
    'consistent-return': 'warn',
    'no-param-reassign': ['warn', {props: false}],
    'react/jsx-no-bind': 'warn',
    'no-nested-ternary': 'warn',
    'jsx-a11y/no-noninteractive-tabindex': 'warn',
    'jsx-a11y/tabindex-no-positive': 'warn',
    'react/jsx-props-no-spreading': 'warn',
    'react/no-array-index-key': 'warn',
    'no-restricted-syntax': 'off',
    'react/jsx-one-expression-per-line': 'off',
    // Configs for rules to match the codebase
    'react/prop-types': ['error', {skipUndeclared: true}],
    'no-underscore-dangle': ['warn', {allowAfterThis: true}],
    '@typescript-eslint/naming-convention': [
      'error',
      {selector: 'default', format: null, trailingUnderscore: 'allow'},
    ],
    'no-plusplus': ['error', {allowForLoopAfterthoughts: true}],
    'prefer-destructuring': ['error', {array: false}],
    '@typescript-eslint/no-unused-expressions': ['error', {allowShortCircuit: true}],
    'prefer-const': ['error', {destructuring: 'all'}],
  },
};
