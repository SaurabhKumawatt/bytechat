export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'utils/**/*.js',
    'models/**/*.js',
    'controllers/**/*.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
