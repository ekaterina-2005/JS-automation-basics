// @ts-check

import { productSchema } from './product.schema.js';

/**
 * One basket item inside a basket products.
 * `BasketId` is a string in the POST response and a number in the other responses.
 */
export const basketItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    ProductId: { type: 'number' },
    BasketId: { type: ['number', 'string'] },
    quantity: { type: 'number' },
  },
  required: ['id', 'ProductId', 'BasketId', 'quantity'],
};

/**
 * The body of basket.
 */
export const basketSchema = {
  type: 'object',
  properties: {
    status: { const: 'success' },
    data: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        UserId: { type: 'number' },
        Products: {
          type: 'array',
          items: {
            ...productSchema,
            properties: {
              ...productSchema.properties,
              BasketItem: basketItemSchema,
            },
            required: [...productSchema.required, 'BasketItem'],
          },
        },
      },
      required: ['id', 'UserId', 'Products'],
    },
  },
  required: ['status', 'data'],
};
