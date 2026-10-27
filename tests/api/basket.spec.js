// @ts-check

import { test, expect } from '../../src/fixtures/api.js';
import { basketItemSchema, basketSchema } from '../../schemas/basket.schema.js';
import {
  attachResponse,
  buildBasketItem,
  expectClientError,
  expectNoServerError,
  expectToMatchSchema,
} from '../../src/utils/apiHelpers.js';
import { tamperToken } from '../../src/utils/jwt.js';
import { HTTP_STATUS, NON_EXISTING_ID } from '../../config/constants.js';

const SINGLE_QUANTITY = 1;
const DOUBLE_QUANTITY = 2;
const NEGATIVE_QUANTITY = -1;
const ZERO_QUANTITY = 0;
const DENIED_STATUSES = [HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN];
const EMPTY_DELETE_BODY = { status: 'success', data: {} };

/**
 * @typedef {{ id: number, name: string, BasketItem: { id: number, quantity: number } }} BasketProduct
 */
/**
 * Gets the products of a basket with the token of its owner.
 *
 * @param {import('../../src/api/JuiceShopClient.js').JuiceShopClient} api - The JuiceShopClient object.
 * @param {{ token: string, basketId: number }} owner - The owner of the basket.
 * @returns {Promise<BasketProduct[]>} The products in the basket.
 */
async function getProducts(api, owner) {
  const response = await api.getBasket(owner.token, owner.basketId);
  expect(response.status, 'Owner must get the basket.').toBe(HTTP_STATUS.OK);

  return response.body.data.Products;
}

test.describe('Basket API: main flow', () => {
  /** @type {Array<{ token: string, itemId: number }>} */
  let createdItems = [];

  // Teardown: the items added by a test are deleted
  test.afterEach(async ({ api }) => {
    for (const { token, itemId } of createdItems) {
      const response = await api.deleteBasketItem(token, itemId);
      expect(response.status, 'Teardown must delete the item.').toBe(
        HTTP_STATUS.OK,
      );
    }
    createdItems = [];
  });

  test('Add a product to the basket and verify it in the basket', async ({
    api,
    user,
    product,
  }) => {
    const productsBefore = await getProducts(api, user);

    const itemId =
      await test.step('Add the product to the basket', async () => {
        const response = await api.addToBasket(
          user.token,
          buildBasketItem(product.id, user.basketId),
        );
        expect(response.status).toBe(HTTP_STATUS.OK);
        createdItems.push({ token: user.token, itemId: response.body.data.id });

        expectToMatchSchema(basketItemSchema, response.body.data);
        expect(response.body.data.ProductId).toBe(product.id);
        expect(response.body.data.quantity).toBe(SINGLE_QUANTITY);
        return response.body.data.id;
      });

    await test.step('Check the basket', async () => {
      const basket = await api.getBasket(user.token, user.basketId);
      expectToMatchSchema(basketSchema, basket.body);

      expect(
        basket.body.data.Products.length,
        'Number of products in the basket must grow by 1.',
      ).toBe(productsBefore.length + 1);

      const added = basket.body.data.Products.find(
        (/** @type {BasketProduct} */ item) => item.id === product.id,
      );
      expect(added.name).toBe(product.name);
      expect(added.BasketItem.quantity).toBe(SINGLE_QUANTITY);
      expect(added.BasketItem.id).toBe(itemId);
    });
  });

  test('Change the quantity of a basket item', async ({
    api,
    user,
    basketItem,
  }) => {
    const response = await api.updateBasketItem(
      user.token,
      basketItem.id,
      DOUBLE_QUANTITY,
    );

    expect(response.status).toBe(HTTP_STATUS.OK);
    expectToMatchSchema(basketItemSchema, response.body.data);
    expect(response.body.data.quantity).toBe(DOUBLE_QUANTITY);

    const products = await getProducts(api, user);
    expect(products).toHaveLength(1);
    expect(products[0].BasketItem.quantity).toBe(DOUBLE_QUANTITY);
  });

  test('Delete a basket item', async ({ api, user, basketItem }) => {
    const before = await getProducts(api, user);

    const response = await api.deleteBasketItem(user.token, basketItem.id);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body).toEqual(EMPTY_DELETE_BODY);

    const after = await getProducts(api, user);
    expect(after).toHaveLength(before.length - 1);
    expect(after.map((item) => item.BasketItem.id)).not.toContain(
      basketItem.id,
    );
  });
});

test.describe('Basket API: authentication and authorization', () => {
  test('Get own basket with own token', async ({ api, user }) => {
    const response = await api.getBasket(user.token, user.basketId);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expectToMatchSchema(basketSchema, response.body);
    expect(response.body.data.id).toBe(user.basketId);
    expect(response.body.data.UserId).toBe(user.id);
  });

  test('Get a basket without Authorization', async ({ api, user }) => {
    const response = await api.getBasket(undefined, user.basketId);

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(JSON.stringify(response.body)).not.toContain('Products');
  });

  test('Get a basket with a tampered token', async ({ api, user }) => {
    const response = await api.getBasket(
      tamperToken(user.token),
      user.basketId,
    );

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(JSON.stringify(response.body)).not.toContain('Products');
  });

  test('Get the basket of another user by id', async ({
    api,
    user,
    otherUser,
  }) => {
    test.fail(
      true,
      'Known issue: the basket of another user is returned (200).',
    );

    const response = await api.getBasket(user.token, otherUser.basketId);
    await attachResponse('Actual response', response);

    expect(DENIED_STATUSES, 'Status must be 401 or 403.').toContain(
      response.status,
    );
    expect(JSON.stringify(response.body)).not.toContain('Products');
  });
});

test.describe('Basket API: add - negative', () => {
  test('Add a product with a non-existing ProductId', async ({ api, user }) => {
    test.fail(true, 'Known issue: the server answers 500 instead of 4xx.');

    const response = await api.addToBasket(
      user.token,
      buildBasketItem(NON_EXISTING_ID, user.basketId),
    );

    await attachResponse('Actual response', response);
    expectClientError(response.status);
  });

  test('Add a product with a negative quantity', async ({
    api,
    user,
    product,
  }) => {
    test.fail(true, 'Known issue: quantity -1 is accepted (200).');

    const response = await api.addToBasket(
      user.token,
      buildBasketItem(product.id, user.basketId, NEGATIVE_QUANTITY),
    );

    await attachResponse('Actual response', response);
    expectClientError(response.status);
    expect(await getProducts(api, user)).toHaveLength(0);
  });

  test('Add a product with quantity 0', async ({ api, user, product }) => {
    test.fail(true, 'Known issue: quantity 0 is accepted (200).');

    const response = await api.addToBasket(
      user.token,
      buildBasketItem(product.id, user.basketId, ZERO_QUANTITY),
    );

    await attachResponse('Actual response', response);
    expectClientError(response.status);
    expect(await getProducts(api, user)).toHaveLength(0);
  });

  test('Add a product without Authorization', async ({
    api,
    user,
    product,
  }) => {
    const response = await api.addToBasket(
      undefined,
      buildBasketItem(product.id, user.basketId),
    );

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(await getProducts(api, user)).toHaveLength(0);
  });

  test('Add a product with quantity as a string', async ({
    api,
    user,
    product,
  }) => {
    const response = await api.addToBasket(
      user.token,
      buildBasketItem(product.id, user.basketId, String(DOUBLE_QUANTITY)),
    );

    expectNoServerError(response.status);
    if (response.status === HTTP_STATUS.OK) {
      const products = await getProducts(api, user);
      expect(products[0].BasketItem.quantity).toBe(DOUBLE_QUANTITY);
    }
  });

  test('Add a product without the ProductId field', async ({ api, user }) => {
    test.fail(true, 'Known issue: the server answers 500 instead of 4xx.');

    const response = await api.addToBasket(user.token, {
      BasketId: String(user.basketId),
      quantity: SINGLE_QUANTITY,
    });

    await attachResponse('Actual response', response);
    expectClientError(response.status);
  });

  test('Add a product without the quantity field', async ({
    api,
    user,
    product,
  }) => {
    const response = await api.addToBasket(user.token, {
      ProductId: product.id,
      BasketId: String(user.basketId),
    });

    expectClientError(response.status);
    expect(await getProducts(api, user)).toHaveLength(0);
  });

  test('Add the same product again with POST', async ({
    api,
    user,
    basketItem,
  }) => {
    test.fail(true, 'Known issue: the server answers 500 to a duplicate.');

    const response = await api.addToBasket(
      user.token,
      buildBasketItem(basketItem.ProductId, user.basketId),
    );

    await attachResponse('Actual response', response);
    expectNoServerError(response.status);
    const products = await getProducts(api, user);
    expect(
      products.filter((item) => item.id === basketItem.ProductId),
    ).toHaveLength(1);
  });

  test('Add a product to the basket of another user', async ({
    api,
    user,
    otherUser,
    product,
  }) => {
    const response = await api.addToBasket(
      user.token,
      buildBasketItem(product.id, otherUser.basketId),
    );
    await attachResponse('Actual response', response);

    expect(DENIED_STATUSES, 'Status must be 401 or 403.').toContain(
      response.status,
    );
    expect(await getProducts(api, otherUser)).toHaveLength(0);
  });
});

test.describe('Basket API: delete - negative', () => {
  test('Delete a non-existing basket item', async ({ api, user }) => {
    const response = await api.deleteBasketItem(user.token, NON_EXISTING_ID);

    expectClientError(response.status);
  });

  test('Delete a basket item without Authorization', async ({
    api,
    user,
    basketItem,
  }) => {
    const response = await api.deleteBasketItem(undefined, basketItem.id);

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    const products = await getProducts(api, user);
    expect(products.map((item) => item.BasketItem.id)).toContain(basketItem.id);
  });

  test('Delete a basket item of another user', async ({
    api,
    user,
    otherUser,
    basketItem,
  }) => {
    test.fail(true, 'Known issue: the item of another user is deleted (200).');

    const response = await api.deleteBasketItem(otherUser.token, basketItem.id);

    await attachResponse('Actual response', response);

    expect(DENIED_STATUSES, 'Status must be 401 or 403.').toContain(
      response.status,
    );
    const products = await getProducts(api, user);
    expect(
      products.map((item) => item.BasketItem.id),
      'The item must stay in the basket of its owner.',
    ).toContain(basketItem.id);
  });
});
