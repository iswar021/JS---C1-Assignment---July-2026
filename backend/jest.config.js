/** Jest configuration for backend integration tests (ts-jest). */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  clearMocks: true,
  // Integration tests that hit the DB are added in the testing milestone.
  testTimeout: 20000,
};
