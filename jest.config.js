/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './scripts/jestGlobalSetup.ts',
  verbose: true,
  testPathIgnorePatterns: ['dist/'],
};
