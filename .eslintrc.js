module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    'standard'
  ],
  rules: {
    'generator-star-spacing': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  globals: {
    '$': true,
    'jQuery': true,
    'RVW_ENV': true,
    'RVW_READY': true,
    'ScrollReveal': true,
    'Video': true,
    'mapboxgl': true,
    'MobileDetect': true,
    'gtag': true
  }
}
