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
    '../models/user.model': {},
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

test('createOrder persists submitted shipping info before creating the order', async () => {
  const connection = createConnection();
  const recorded = {
    profileUpdates: [],
    createOrderArgs: undefined,
    orderItems: [],
    decrements: [],
    cartClearedFor: undefined,
    notifications: []
  };

  const orderModel = {
    getConnection: async () => connection,
    findCartItemsForCheckout: async () => [
      { part_id: 7, quantity: 2, price: 150000, stock_quantity: 5, name: 'Ắc quy' }
    ],
    createOrderRecord: async (...args) => {
      recorded.createOrderArgs = args;
      return { insertId: 42 };
    },
    createOrderItem: async (...args) => {
      recorded.orderItems.push(args);
      return { insertId: 1 };
    },
    decrementPartStock: async (...args) => {
      recorded.decrements.push(args);
    },
    clearCartByUserId: async (...args) => {
      recorded.cartClearedFor = args;
    }
  };

  const userModel = {
    updateProfileById: async (...args) => {
      recorded.profileUpdates.push(args);
    }
  };

  const notificationModel = {
    createNotification: async (...args) => {
      recorded.notifications.push(args);
    }
  };

  const { createOrder } = loadWithMocks('../../controllers/order.controller.js', {
    '../models/order.model': orderModel,
    '../models/user.model': userModel,
    '../models/notification.model': notificationModel
  });

  const response = createResponse();

  await createOrder({
    user: { id: 5 },
    body: {
      full_name: 'Nguyen Van A',
      phone: '0909123456',
      address: '123 Duong ABC',
      notes: 'Giao buoi sang'
    }
  }, response);

  assert.deepEqual(recorded.profileUpdates, [
    [5, {
      full_name: 'Nguyen Van A',
      phone: '0909123456',
      address: '123 Duong ABC'
    }]
  ]);
  assert.deepEqual(recorded.createOrderArgs, [connection, 5, 300000, 'PENDING']);
  assert.deepEqual(recorded.orderItems, [[connection, 42, 7, 2, 150000]]);
  assert.deepEqual(recorded.decrements, [[connection, 2, 7]]);
  assert.deepEqual(recorded.cartClearedFor, [connection, 5]);
  assert.equal(connection.committed, true);
  assert.equal(connection.released, true);
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.body, {
    success: true,
    message: 'Order created successfully',
    data: { order_id: 42, total_amount: 300000, status: 'PENDING' }
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
    '../models/user.model': {},
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
    '../models/user.model': {},
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
