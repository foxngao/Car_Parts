const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('auth model findUserIdByUsernameOrEmail queries users by username or email', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 7 }]];
    }
  };

  const authModel = loadWithMocks('../../models/auth.model.js', {
    '../config/db': db
  });

  const result = await authModel.findUserIdByUsernameOrEmail('alice', 'alice@example.com');

  assert.deepEqual(calls, [[
    'SELECT id FROM users WHERE username = ? OR email = ?',
    ['alice', 'alice@example.com']
  ]]);
  assert.deepEqual(result, [{ id: 7 }]);
});

test('auth model findLoginUserByUsername queries grouped roles for login', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 1, username: 'alice', roles: 'user' }]];
    }
  };

  const authModel = loadWithMocks('../../models/auth.model.js', {
    '../config/db': db
  });

  const result = await authModel.findLoginUserByUsername('alice');

  assert.equal(calls[0][1][0], 'alice');
  assert.match(calls[0][0], /GROUP_CONCAT\(r\.name\) as roles/);
  assert.deepEqual(result, [{ id: 1, username: 'alice', roles: 'user' }]);
});
