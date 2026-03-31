const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('cart model findCartItemsByUserId queries cart rows with part info', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 1, subtotal: 10 }]];
    }
  };

  const cartModel = loadWithMocks('../../models/cart.model.js', {
    '../config/db': db
  });

  const result = await cartModel.findCartItemsByUserId(8);

  assert.equal(calls[0][1][0], 8);
  assert.match(calls[0][0], /FROM cart_items ci/);
  assert.deepEqual(result, [{ id: 1, subtotal: 10 }]);
});

test('cart model deleteCartItemById deletes by item and user ids', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [{ affectedRows: 0 }];
    }
  };

  const cartModel = loadWithMocks('../../models/cart.model.js', {
    '../config/db': db
  });

  const result = await cartModel.deleteCartItemById(15, 8);

  assert.deepEqual(calls, [[
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [15, 8]
  ]]);
  assert.deepEqual(result, { affectedRows: 0 });
});
