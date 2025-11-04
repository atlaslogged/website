module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'js/**/*.js',
    'apps-script/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'test/coverage',
  verbose: true,
  testTimeout: 30000, // 30 seconds (API tests may take time)
};
