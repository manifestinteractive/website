const version = require('../../../package.json').version
const date = new Date()
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'
const isProd = env === 'production'

module.exports = {
  analytics: isProd ? 'G-0VFCSYJM7Z' : 'G-C2E9TKCD53',
  googleAPI: isProd ? 'AIzaSyAZbGCa28EOzyhBzK3mH28MU5w3PLOVc9Q' : 'AIzaSyDH_Vnp0IaAmFuCx0orTjIJsxkAlM03B6A',
  googleSearchCX: '278575f6a5e288960',
  assetPath: isProd ? 'https://d14qmhpz0yq7x9.cloudfront.net/' : '/assets/',
  cacheBreak: isProd ? '' : `?ac${new Date().getTime()}`,
  currentYear: date.getFullYear(),
  currentDate: date.toISOString().slice(0, 10),
  env: env,
  robots: isProd ? 'index,follow' : 'noindex,nofollow',
  version: version
}
