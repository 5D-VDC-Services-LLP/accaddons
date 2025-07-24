// jest.config.js
module.exports = {
  // ...other Jest configurations
  testEnvironment: 'jsdom', // or 'node'
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    // Keep node_modules ignored, but specifically include node-fetch
    // Adjust the regex to include any other ESM packages that throw this error
    'node_modules/(?!(node-fetch|@mswjs)/)',
  ],
  // If you are using React and Babel, ensure this is set:
  // transform: {
  //   '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  // },
  // moduleNameMapper: {
  //   '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Example for CSS modules
  // },
};