export const configZLP = {
  app_id: process.env.ZLP_MERCHANT_APP_ID,
  key1: process.env.ZLP_MERCHANT_KEY1,
  key2: process.env.ZLP_MERCHANT_KEY2,
  zlp_endpoint: process.env.ZLP_MERCHANT_ENDPOINT,
  host: process.env.MERCHANT_ENDPOINT
};

export const ZLP_API_PATH = {
  CREATE_ORDER: "/create",
  QUERY_ORDER: "/query",
  AGREEMENT_BINDING: "/agreement/bind",
  AGREEMENT_UNBINDING: "/agreement/unbind",
  AGREEMENT_QUERY: "/agreement/query",
  AGREEMENT_BALANCE: "/agreement/balance",
  AGREEMENT_PAY: "/agreement/pay",
  AGREEMENT_QUERY_USER: "/agreement/query_user",
}

export const API_ROUTES = {
  CREATE_ORDER: "/api/create",
  QUERY_ORDER: "/api/query",
  AGREEMENT_BINDING: "/api/agreement/bind",
  AGREEMENT_UNBINDING: "/api/agreement/unbind",
  AGREEMENT_QUERY: "/api/agreement/query",
  AGREEMENT_BALANCE: "/api/agreement/balance",
  AGREEMENT_PAY: "/api/agreement/pay",
  AGREEMENT_QUERY_USER: "/api/agreement/query_user",
  AGREEMENT_CALLBACK: "/api/callback/agreement",
  CREATE_ORDER_CALLBACK: "/api/callback/order",
}