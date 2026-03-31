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

test('getNotifications parses JSON data from notification model results', async () => {
  const notificationModel = {
    findNotificationsByUserId: async () => ([
      {
        id: 1,
        user_id: 5,
        type: 'order_created',
        title: 'Created',
        message: 'Done',
        data: '{"orderId":10}',
        is_read: 0,
        created_at: '2026-01-01'
      }
    ])
  };

  const { getNotifications } = loadWithMocks('../../controllers/notification.controller.js', {
    '../models/notification.model': notificationModel
  });

  const response = createResponse();

  await getNotifications({ user: { id: 5 } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: [
      {
        id: 1,
        user_id: 5,
        type: 'order_created',
        title: 'Created',
        message: 'Done',
        data: { orderId: 10 },
        is_read: 0,
        created_at: '2026-01-01'
      }
    ]
  });
});

test('getUnreadCount returns count from notification model', async () => {
  const notificationModel = {
    countUnreadByUserId: async () => [{ count: 3 }]
  };

  const { getUnreadCount } = loadWithMocks('../../controllers/notification.controller.js', {
    '../models/notification.model': notificationModel
  });

  const response = createResponse();

  await getUnreadCount({ user: { id: 5 } }, response);

  assert.deepEqual(response.body, {
    success: true,
    data: { count: 3 }
  });
});

test('markAsRead returns 404 when notification model updates no row', async () => {
  let receivedArgs;
  const notificationModel = {
    markAsReadById: async (...args) => {
      receivedArgs = args;
      return { affectedRows: 0 };
    }
  };

  const { markAsRead } = loadWithMocks('../../controllers/notification.controller.js', {
    '../models/notification.model': notificationModel
  });

  const response = createResponse();

  await markAsRead({ params: { id: '9' }, user: { id: 5 } }, response);

  assert.deepEqual(receivedArgs, ['9', 5]);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Notification not found'
  });
});
