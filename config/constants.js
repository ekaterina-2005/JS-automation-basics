export const BACKEND_DATA = [
  {
    id: 1,
    productName: 'Phone',
    currentPrice: '15.99 USD',
    stockQty: 2,
    isPublished: 'true',
  },
];
export const FILTER_STATUS = true;
export const TRUE_STRING = 'true';
export const RAW_CONFIG = {
  gateway: 'https://eu-region.shop.com',
  // currency: "EUR", - must be added
  userDetails: {
    // profile: { role: "admin" } - must be added
  },
};
export const EXPECTED_CONFIG = {
  url: 'https://eu-region.shop.com',
  currency: 'EUR',
  role: 'viewer',
};
export const CURRENCY = 'EUR';
export const ROLE = 'viewer';
export const CONTEXT_TIMEOUT_MS = 1000;
export const API_USERS = `api/users`;
export const USERS_ID = [1, 2, 3];
export const DELAY_MS = 1000;
export const DELAY_FETCH_URL = 'https://reqres.in/api/users?delay=3';
export const FALSE_FETCH_URL = 'https://httpbin.org/status/500';
export const ATTEMPTS = 3;
export const TIMEOUT_MS = 1000;
export const CACHE_TTL = 5000;
export const USER_URL = 'https://reqres.in/api/users/2';
export const ALLOWED_STATUSES = [200];
