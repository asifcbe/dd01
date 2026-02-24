/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|scss|sass)$': '<rootDir>/src/test/styleMock.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/*.test.[jt]s?(x)'],
  transformIgnorePatterns: ['/node_modules/(?!(@mui)/)'],
  testTimeout: 30000,
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './jest-report',
        filename: 'report.html',
        openReport: false,
      },
    ],
  ],
};
