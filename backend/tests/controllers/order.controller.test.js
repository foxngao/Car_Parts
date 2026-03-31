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

const createConnection = () => ({
  released: false,
  rolledBack: false,
  committed: false,
  async beginTransaction() {},
  async rollback() {
    this.rolledBack = true;
  },
  async commit() {
    this.committed = true;
  },
  release() {
    this.released = true;
  }
});

test('createOrder returns 400 when order model finds an empty cart', async () => {
  const connection = createConnection();
  let receivedArgs;
  const orderModel = {
    getConnection: async () => connection,
    findCartItemsForCheckout: async (...args) => {
      receivedArgs = args;
      return [];
    }
  };

  const { createOrder } = loadWithMocks('../../controllers/order.controller.js', {
    '../models/order.model': orderModel,
    '../models/notification.model': {}
  });

  const response = createResponse();

  await createOrder({ user: { id: 5 } }, response);

  assert.deepEqual(receivedArgs, [connection, 5]);
  assert.equal(connection.rolledBack, true);
  assert.equal(connection.released, true);
  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Cart is empty'
  });
});

test('getOrderById returns 404 when order model cannot find the order', async () => {
  let receivedArgs;
  const orderModel = {
    findOrderByIdForUser: async (...args) => {
      receivedArgs = args;
      return [];
    }
  };

  const { getOrderById } = loadWithMocks('../../controllers/order.controller.js', {
    '../models/order.model': orderModel,
    '../models/notification.model': {}
  });

  const response = createResponse();

  await getOrderById({ params: { id: '10' }, user: { id: 5 } }, response);

  assert.deepEqual(receivedArgs, ['10', 5]);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Order not found'
  });
});

test('updateOrderStatus returns 404 when order model cannot find the order', async () => {
  const connection = createConnection();
  let receivedArgs;
  const orderModel = {
    getConnection: async () => connection,
    findOrderById: async (...args) => {
      receivedArgs = args;
      return [];
    }
  };

  const { updateOrderStatus } = loadWithMocks('../../controllers/order.controller.js', {
    '../models/order.model': orderModel,
    '../models/notification.model': {}
  });

  const response = createResponse();

  await updateOrderStatus({ params: { id: '11' }, body: { status: 'PAID' }, user: { id: 1 } }, response);

  assert.deepEqual(receivedArgs, [connection, '11']);
  assert.equal(connection.rolledBack, true);
  assert.equal(connection.released, true);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Không tìm thấy đơn hàng'
  });
});
