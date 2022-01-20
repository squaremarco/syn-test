/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  coverageReporters: ['json', 'html'],
  collectCoverage: false,
  testTimeout: 5000,
  globalSetup: './__tests__/globalSetup.ts',
  collectCoverageFrom: ['**/*.ts', '!**/node_modules/**'],
  testMatch: ['**/__tests__/**/*.(test|spec).ts', '!**/__tests__/**/*.heavy.ts'],
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.jest.json'
    }
  }
};
