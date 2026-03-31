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

test('register returns 409 when auth model reports duplicate username or email', async () => {
  let receivedArgs;
  const authModel = {
    findUserIdByUsernameOrEmail: async (...args) => {
      receivedArgs = args;
      return [{ id: 7 }];
    }
  };

  const { register } = loadWithMocks('../../controllers/auth.controller.js', {
    '../models/auth.model': authModel
  });

  const response = createResponse();

  await register({ body: { username: 'alice', password: 'secret', email: 'alice@example.com' } }, response);

  assert.deepEqual(receivedArgs, ['alice', 'alice@example.com']);
  assert.equal(response.statusCode, 409);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Username or email already exists'
  });
});

test('verifyOtp returns 404 when auth model cannot find user by email', async () => {
  let receivedEmail;
  const authModel = {
    findUserIdByEmail: async (email) => {
      receivedEmail = email;
      return [];
    }
  };

  const { verifyOtp } = loadWithMocks('../../controllers/auth.controller.js', {
    '../models/auth.model': authModel
  });

  const response = createResponse();

  await verifyOtp({ body: { email: 'missing@example.com', otp_code: '123456' } }, response);

  assert.equal(receivedEmail, 'missing@example.com');
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'User not found'
  });
});

test('login returns 401 when auth model finds no matching user', async () => {
  let receivedUsername;
  const authModel = {
    findLoginUserByUsername: async (username) => {
      receivedUsername = username;
      return [];
    }
  };

  const { login } = loadWithMocks('../../controllers/auth.controller.js', {
    '../models/auth.model': authModel
  });

  const response = createResponse();

  await login({ body: { username: 'ghost', password: 'secret' } }, response);

  assert.equal(receivedUsername, 'ghost');
  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Invalid username or password'
  });
});
