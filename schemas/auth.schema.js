// @ts-check

/**
 * The body of a successful login.
 */
export const loginSchema = {
  type: 'object',
  properties: {
    authentication: {
      type: 'object',
      properties: {
        token: { type: 'string', minLength: 1 },
        bid: { type: 'number' },
        umail: { type: 'string' },
      },
      required: ['token', 'bid', 'umail'],
    },
  },
  required: ['authentication'],
};
