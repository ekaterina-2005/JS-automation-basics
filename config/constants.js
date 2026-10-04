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

// OWASP Juice Shop
export const OWASP_LOGIN_PAGE_URL = '/#/login';
export const OWASP_REGISTRATION_PAGE_URL = '/#/register';
export const OWASP_PRODUCTS_PAGE_URL = '/#/search';
export const OWASP_BASKET_PAGE_URL = '/#/basket';
export const OWASP_CURRENCY = '¤';
export const PRODUCT_PRICE_PATTERN = new RegExp(`\\d${OWASP_CURRENCY}`);
// cookies
export const WELCOME_BANNER_COOKIE = 'welcomebanner_status';
export const COOKIE_CONSENT_COOKIE = 'cookieconsent_status';
export const DISMISSED_COOKIE_VALUE = 'dismiss';
export const TOKEN_COOKIE = 'token';
// timeouts
export const OPTION_VISIBLE_TIMEOUT_MS = 1000;
export const OPEN_SELECT_TIMEOUT_MS = 15000;
// built-in Juice Shop user, it exists right after the container starts
export const ADMIN_EMAIL = 'admin@juice-sh.op';
export const ADMIN_PASSWORD = 'admin123';
// test user
export const TEST_EMAIL_PREFIX = 'aqa.';
export const TEST_EMAIL_DOMAIN = '@shop.test';
export const TEST_USER_PASSWORD = 'Test@12345';
export const TEST_SECURITY_ANSWER = 'Test';
// registration form
export const INVALID_EMAIL = 'qa.user';
export const PASSWORD_MIN_LENGTH = 5;
export const PASSWORD_MAX_LENGTH = 40;
export const PASSWORD_FILLER_CHAR = 'Q';
export const TOO_SHORT_PASSWORD = PASSWORD_FILLER_CHAR.repeat(
  PASSWORD_MIN_LENGTH - 1,
);
export const TOO_LONG_PASSWORD = PASSWORD_FILLER_CHAR.repeat(
  PASSWORD_MAX_LENGTH + 1,
);
export const MISMATCHED_PASSWORD = 'Test@54321';
export const MASKED_INPUT_TYPE = 'password';
// login form
export const UNREGISTERED_EMAIL = 'not.registered@juice.test';
export const WRONG_PASSWORD = 'WrongPass123!';
export const INVALID_CREDENTIALS = [
  { title: 'wrong password', email: ADMIN_EMAIL, password: WRONG_PASSWORD },
  {
    title: 'non-existing user',
    email: UNREGISTERED_EMAIL,
    password: ADMIN_PASSWORD,
  },
  {
    title: 'invalid email format',
    email: INVALID_EMAIL,
    password: ADMIN_PASSWORD,
  },
];
// basket
export const EMPTY_BASKET_PRICE = `0${OWASP_CURRENCY}`;
export const TOTAL_PRICE_LABEL = 'Total Price: ';
export const GUEST_BASKET_OWNER = '(anonymous)';
