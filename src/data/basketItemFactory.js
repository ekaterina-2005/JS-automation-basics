// @ts-check

/**
 * Builds the body of POST for basket items.
 *
 * @param {number | string} productId - The product id.
 * @param {number | string} basketId - The basket id.
 * @param {unknown} [quantity=1] - The quantity. Any type, so negative checks can send wrong values.
 * @returns {{ ProductId: number | string, BasketId: string, quantity: unknown }} The basket item data.
 */
export function buildBasketItem(productId, basketId, quantity = 1) {
  return { ProductId: productId, BasketId: String(basketId), quantity };
}
