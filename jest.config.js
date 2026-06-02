// jest.config.js
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterFramework: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/domain/**/*.ts',
    'src/**/utils/**/*.ts',
    'src/shared/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react' } }],
  },
  // Don't try to transform native modules in unit tests
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@unimodules|nativewind)',
  ],
};
