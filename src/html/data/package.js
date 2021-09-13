const version = require('../../../package.json').version
const date = new Date()
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'
const isProd = env === 'production'

module.exports = {
  analytics: isProd ? 'G-0VFCSYJM7Z' : 'G-C2E9TKCD53',
  base: isProd ? 'https://www.manifestinteractive.com' : 'https://dev.manifestinteractive.com',
  googleAPI: isProd ? 'AIzaSyAZbGCa28EOzyhBzK3mH28MU5w3PLOVc9Q' : 'AIzaSyDH_Vnp0IaAmFuCx0orTjIJsxkAlM03B6A',
  googleReCAPTCHA: isProd ? '6LdbkF4cAAAAAO1TcSMpvfi4VNGHU9B7jdy5FH65' : '6LeFm14cAAAAAJvd179ZxMEFfuYFTqaH8lSZ0Kj5',
  googleSearchCX: '278575f6a5e288960',
  assetPath: '/assets/',
  cacheBreak: isProd ? '' : `?ac${new Date().getTime()}`,
  currentYear: date.getFullYear(),
  currentDate: date.toISOString().slice(0, 10),
  publishedDate: date.toISOString(),
  env: env,
  robots: isProd ? 'index,follow' : 'noindex,nofollow',
  version: version
}
