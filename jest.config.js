const {defaults} = require('jest-config');

module.exports = {
  "roots": [
    "src"
  ],
  "transform": {
//   "^.+\\.jsx?$": "babel-jest",
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  testPathIgnorePatterns: ['node_modules', '.cache'],
  transformIgnorePatterns: ['node_modules/(?!(gatsby)/)'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
};
