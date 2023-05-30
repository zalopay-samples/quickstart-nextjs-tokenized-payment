const {
  PHASE_PRODUCTION_BUILD,
} = require('next/constants')

module.exports = (phase) => {
   // when `next build` or `npm run build` is used
   const isProd = phase === PHASE_PRODUCTION_BUILD && process.env.STAGING !== '1'

   const env = {
    ZLP_MERCHANT_APP_ID: '2554',
    ZLP_MERCHANT_KEY1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
    ZLP_MERCHANT_KEY2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
    ZLP_MERCHANT_ENDPOINT: 'https://sb-openapi.zalopay.vn/v2',
    MERCHANT_ENDPOINT: (() => {
      // For prod env
      if (isProd) return "https://zalopay-tokenized-payment.vercel.app"
      // For local env
      return "http://localhost:3000"
    })(),
   }
   return {
    webpack5: true,
    env
   }
};
