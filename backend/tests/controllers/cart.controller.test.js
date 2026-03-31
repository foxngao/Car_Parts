const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  }
});

test('getCartItems returns items loaded through cart model', async () => {
  let receivedUserId;
  const cartModel = {
    findCartItemsByUserId: async (userId) => {
      receivedUserId = userId;
      return [{ id: 1, subtotal: 12.5 }];
    }
  };

  const { getCartItems } = loadWithMocks('../../controllers/cart.controller.js', {
    '../models/cart.model': cartModel
  });

  const response = createResponse();

  await getCartItems({ user: { id: 8 } }, response);

  assert.equal(receivedUserId, 8);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: {
      items: [{ id: 1, subtotal: 12.5 }],
      total: 12.5
    }
  });
});

test('addToCart returns 404 when cart model cannot find the part', async () => {
  const cartModel = {
    findPartStockById: async () => []
  };

  const { addToCart } = loadWithMocks('../../controllers/cart.controller.js', {
    '../models/cart.model': cartModel
  });

  const response = createResponse();

  await addToCart({ user: { id: 8 }, body: { part_id: 99, quantity: 1 } }, response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Part not found'
  });
});

test('removeCartItem returns 404 when cart model deletes no row', async () => {
  let receivedArgs;
  const cartModel = {
    deleteCartItemById: async (...args) => {
      receivedArgs = args;
      return { affectedRows: 0 };
    }
  };

  const { removeCartItem } = loadWithMocks('../../controllers/cart.controller.js', {
    '../models/cart.model': cartModel
  });

  const response = createResponse();

  await removeCartItem({ params: { id: '15' }, user: { id: 8 } }, response);

  assert.deepEqual(receivedArgs, ['15', 8]);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Cart item not found'
  });
});
