const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

const bcrypt = { hash: async () => 'hashed' };

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
    '../models/admin.model': adminModel,
    '../models/booking.model': {},
    bcryptjs: bcrypt
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
    '../models/admin.model': adminModel,
    '../models/booking.model': {},
    bcryptjs: bcrypt
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
    '../models/admin.model': adminModel,
    '../models/booking.model': {},
    bcryptjs: bcrypt
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

test('getAllGarages returns raw garages from booking model', async () => {
  const expectedGarages = [{ id: 1, name: 'Garage A' }];
  const bookingModel = {
    getAllGarages: async () => expectedGarages
  };

  const { getAllGarages } = loadWithMocks('../../controllers/admin.controller.js', {
    '../models/admin.model': {},
    '../models/booking.model': bookingModel,
    bcryptjs: bcrypt
  });

  const response = createResponse();

  await getAllGarages({}, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, expectedGarages);
});

test('createGarage delegates req.body and returns success message', async () => {
  let receivedPayload;
  const bookingModel = {
    createGarage: async (payload) => {
      receivedPayload = payload;
    }
  };

  const { createGarage } = loadWithMocks('../../controllers/admin.controller.js', {
    '../models/admin.model': {},
    '../models/booking.model': bookingModel,
    bcryptjs: bcrypt
  });

  const response = createResponse();
  const request = {
    body: { name: 'Garage B', address: '123 Street', phone: '0909' }
  };

  await createGarage(request, response);

  assert.deepEqual(receivedPayload, request.body);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { message: 'Thêm gara thành công' });
});

test('updateGarage delegates params/body and returns success message', async () => {
  let receivedArgs;
  const bookingModel = {
    updateGarage: async (...args) => {
      receivedArgs = args;
    }
  };

  const { updateGarage } = loadWithMocks('../../controllers/admin.controller.js', {
    '../models/admin.model': {},
    '../models/booking.model': bookingModel,
    bcryptjs: bcrypt
  });

  const response = createResponse();
  const request = {
    params: { id: '7' },
    body: { name: 'Garage C', is_active: true }
  };

  await updateGarage(request, response);

  assert.deepEqual(receivedArgs, ['7', request.body]);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { message: 'Cập nhật thành công' });
});

test('getAllBookings returns raw bookings from booking model', async () => {
  const expectedBookings = [{ id: 11, status: 'PENDING' }];
  const bookingModel = {
    getAllBookings: async () => expectedBookings
  };

  const { getAllBookings } = loadWithMocks('../../controllers/admin.controller.js', {
    '../models/admin.model': {},
    '../models/booking.model': bookingModel,
    bcryptjs: bcrypt
  });

  const response = createResponse();

  await getAllBookings({}, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, expectedBookings);
});

test('updateBookingStatus delegates booking id/status and returns success message', async () => {
  let receivedArgs;
  const bookingModel = {
    updateBookingStatus: async (...args) => {
      receivedArgs = args;
    }
  };

  const { updateBookingStatus } = loadWithMocks('../../controllers/admin.controller.js', {
    '../models/admin.model': {},
    '../models/booking.model': bookingModel,
    bcryptjs: bcrypt
  });

  const response = createResponse();
  const request = {
    params: { id: '21' },
    body: { status: 'CONFIRMED' }
  };

  await updateBookingStatus(request, response);

  assert.deepEqual(receivedArgs, ['21', 'CONFIRMED']);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { message: 'Cập nhật trạng thái thành công' });
});
