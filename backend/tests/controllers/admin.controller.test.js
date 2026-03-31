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

test('getAllUsers maps roles from admin model results', async () => {
  const adminModel = {
    findAllUsers: async () => ([
      {
        id: 1,
        username: 'admin1',
        email: 'admin@example.com',
        full_name: 'Admin One',
        phone: null,
        address: null,
        is_active: 1,
        created_at: '2026-01-01',
        roles: 'user,admin'
      }
    ])
  };

  const { getAllUsers } = loadWithMocks('../../controllers/admin.controller.js', {
    '../models/admin.model': adminModel
  });

  const response = createResponse();

  await getAllUsers({}, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: [
      {
        id: 1,
        username: 'admin1',
        email: 'admin@example.com',
        full_name: 'Admin One',
        phone: null,
        address: null,
        is_active: true,
        created_at: '2026-01-01',
        role: 'admin'
      }
    ]
  });
});

test('createUser returns 409 when admin model reports duplicate username or email', async () => {
  let receivedArgs;
  const adminModel = {
    findExistingUserByUsernameOrEmail: async (...args) => {
      receivedArgs = args;
      return [{ id: 5 }];
    }
  };

  const { createUser } = loadWithMocks('../../controllers/admin.controller.js', {
    '../models/admin.model': adminModel
  });

  const response = createResponse();

  await createUser({
    body: { username: 'alice', email: 'alice@example.com', password: 'secret', role: 'user' }
  }, response);

  assert.deepEqual(receivedArgs, ['alice', 'alice@example.com']);
  assert.equal(response.statusCode, 409);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Tên đăng nhập hoặc email đã tồn tại'
  });
});

test('toggleUserStatus returns 404 when admin model updates no rows', async () => {
  let receivedArgs;
  const adminModel = {
    updateUserStatusById: async (...args) => {
      receivedArgs = args;
      return { affectedRows: 0 };
    }
  };

  const { toggleUserStatus } = loadWithMocks('../../controllers/admin.controller.js', {
    '../models/admin.model': adminModel
  });

  const response = createResponse();

  await toggleUserStatus({ params: { id: '3' }, body: { is_active: 0 } }, response);

  assert.deepEqual(receivedArgs, ['3', 0]);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'User not found'
  });
});
