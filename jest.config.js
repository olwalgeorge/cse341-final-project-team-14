module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000, // increase timeout for tests involving database operations
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
