const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('order model findOrdersByUserId queries user orders descending', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 1, status: 'PENDING' }]];
    }
  };

  const orderModel = loadWithMocks('../../models/order.model.js', {
    '../config/db': db
  });

  const result = await orderModel.findOrdersByUserId(5);

  assert.equal(calls[0][1][0], 5);
  assert.match(calls[0][0], /FROM orders WHERE user_id = \?/);
  assert.deepEqual(result, [{ id: 1, status: 'PENDING' }]);
});

test('order model findOrderById queries transaction connection by id', async () => {
  const calls = [];
  const connection = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 11, status: 'PENDING' }]];
    }
  };

  const orderModel = loadWithMocks('../../models/order.model.js', {
    '../config/db': { query: async () => { throw new Error('not used'); } }
  });

  const result = await orderModel.findOrderById(connection, 11);

  assert.deepEqual(calls, [[
    'SELECT * FROM orders WHERE id = ?',
    [11]
  ]]);
  assert.deepEqual(result, [{ id: 11, status: 'PENDING' }]);
});
