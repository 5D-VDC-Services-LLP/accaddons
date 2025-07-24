// babel.config.js
// Change from CommonJS (module.exports) to ES Module (export default)
export default { // <-- Change this line
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react', // If you're using React, include this
  ],
};