// @ts-check

/**
 * One product from search.
 */
export const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    deluxePrice: { type: 'number' },
    image: { type: 'string' },
  },
  required: ['id', 'name', 'description', 'price', 'image'],
};

/**
 * The body of search.
 */
export const productListSchema = {
  type: 'object',
  properties: {
    status: { const: 'success' },
    data: { type: 'array', items: productSchema },
  },
  required: ['status', 'data'],
};
