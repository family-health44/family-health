// .eslintrc.js
// Airbnb + TypeScript rules with documented React Native overrides.
// Every rule override must include a comment explaining why.

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react-native/all',
  ],
  plugins: [
    '@typescript-eslint',
    'import',
    'react',
    'react-hooks',
    'react-native',
  ],
  rules: {
    // --- TypeScript ---
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off', // inference handles most cases
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // --- Import ordering (enforce layer rules) ---
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        pathGroups: [
          { pattern: 'react', group: 'external', position: 'before' },
          { pattern: 'react-native', group: 'external', position: 'before' },
          { pattern: '@/**', group: 'internal' },
        ],
        pathGroupsExcludedImportTypes: ['react', 'react-native'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-unresolved': 'error', // catches @/ alias drift between babel and tsconfig
    'import/prefer-default-export': 'off', // named exports are clearer in feature layers
    'import/no-default-export': 'off', // screens and route files require default exports

    // --- React ---
    'react/react-in-jsx-scope': 'off', // not needed with new JSX transform
    'react/require-default-props': 'off', // TypeScript handles this
    'react/prop-types': 'off', // TypeScript handles this
    'react/jsx-props-no-spreading': 'off', // needed for form field components
    'react/function-component-definition': [
      'error',
      { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
    ],

    // --- React Native ---
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn', // prefer NativeWind classes
    'react-native/no-color-literals': 'warn', // use design tokens
    'react-native/no-raw-text': 'error',

    // --- General ---
    'no-console': 'off',
    'no-restricted-imports': [
      'error',
      {
        // Enforce layer rules: no direct Supabase imports outside repositories
        paths: [
          {
            name: '@supabase/supabase-js',
            message: 'Import Supabase only via @/lib/supabase — never directly in components, hooks, or screens.',
          },
        ],
      },
    ],
  },
 settings: {
    react: { version: 'detect' },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  env: {
    'react-native/react-native': true,
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.expo/',
    'coverage/',
    'babel.config.js', // config files are not typed
    'jest.config.js',
    'metro.config.js',
  ],
};
