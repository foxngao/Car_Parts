const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const express = require('express');

const { loadWithMocks } = require('../helpers/module-loader');

const requestJson = (server, method, path, payload) => new Promise((resolve, reject) => {
  const address = server.address();
  const body = payload === undefined ? undefined : JSON.stringify(payload);
  const headers = body
    ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    : {};

  const req = http.request({
    hostname: '127.0.0.1',
    port: address.port,
    path,
    method,
    headers
  }, (res) => {
    let raw = '';
    res.on('data', (chunk) => {
      raw += chunk;
    });
    res.on('end', () => {
      const isJson = (res.headers['content-type'] || '').includes('application/json');
      resolve({
        statusCode: res.statusCode,
        body: raw,
        json: isJson && raw ? JSON.parse(raw) : undefined
      });
    });
  });

  req.on('error', reject);
  if (body) {
    req.write(body);
  }
  req.end();
});

test('admin garage and booking routes delegate to admin controller handlers', async (t) => {
  const calls = {
    getAllGarages: 0,
    createGarage: 0,
    updateGarage: 0,
    getAllBookings: 0,
    updateBookingStatus: 0
  };

  let capturedCreateGarageBody;
  let capturedUpdateGarage;
  let capturedUpdateBookingStatus;

  const adminController = {
    getDashboardStats: (req, res) => res.json({ ok: 'dashboard' }),
    getDetailedStatistics: (req, res) => res.json({ ok: 'detailed' }),
    getAllUsers: (req, res) => res.json({ ok: 'users' }),
    createUser: (req, res) => res.json({ ok: 'create-user' }),
    updateUser: (req, res) => res.json({ ok: 'update-user' }),
    deleteUser: (req, res) => res.json({ ok: 'delete-user' }),
    toggleUserStatus: (req, res) => res.json({ ok: 'toggle-user-status' }),
    getRevenueStats: (req, res) => res.json({ ok: 'revenue' }),
    getAllGarages: (req, res) => {
      calls.getAllGarages += 1;
      res.json({ ok: 'getAllGarages-controller' });
    },
    createGarage: (req, res) => {
      calls.createGarage += 1;
      capturedCreateGarageBody = req.body;
      res.json({ ok: 'createGarage-controller' });
    },
    updateGarage: (req, res) => {
      calls.updateGarage += 1;
      capturedUpdateGarage = { id: req.params.id, body: req.body };
      res.json({ ok: 'updateGarage-controller' });
    },
    getAllBookings: (req, res) => {
      calls.getAllBookings += 1;
      res.json({ ok: 'getAllBookings-controller' });
    },
    updateBookingStatus: (req, res) => {
      calls.updateBookingStatus += 1;
      capturedUpdateBookingStatus = { id: req.params.id, status: req.body.status };
      res.json({ ok: 'updateBookingStatus-controller' });
    }
  };

  const noOpMiddleware = (req, res, next) => next();
  const auth = {
    verifyToken: noOpMiddleware,
    isAdmin: noOpMiddleware
  };

  const routeModule = loadWithMocks('../../routes/admin.routes.js', {
    '../controllers/admin.controller': adminController,
    '../controllers/brand.controller': { createBrand: noOpMiddleware, updateBrand: noOpMiddleware, deleteBrand: noOpMiddleware },
    '../controllers/model.controller': {
      createModel: noOpMiddleware,
      updateModel: noOpMiddleware,
      deleteModel: noOpMiddleware,
      createModelYear: noOpMiddleware,
      deleteModelYear: noOpMiddleware
    },
    '../controllers/category.controller': { createCategory: noOpMiddleware, updateCategory: noOpMiddleware, deleteCategory: noOpMiddleware },
    '../controllers/part.controller': { createPart: noOpMiddleware, updatePart: noOpMiddleware, deletePart: noOpMiddleware, addCompatibility: noOpMiddleware },
    '../controllers/order.controller': { getAllOrders: noOpMiddleware, updateOrderStatus: noOpMiddleware },
    '../middlewares/auth': auth,
    '../middlewares/validate': noOpMiddleware,
    '../models/booking.model': {
      getAllGarages: async () => [{ id: 1 }],
      createGarage: async () => ({}),
      updateGarage: async () => {},
      getAllBookings: async () => [{ id: 2 }],
      updateBookingStatus: async () => {}
    }
  });

  const app = express();
  app.use(express.json());
  app.use('/api/v1/admin', routeModule);

  const server = app.listen(0);
  t.after(() => server.close());

  const garagesResponse = await requestJson(server, 'GET', '/api/v1/admin/garages');
  assert.equal(garagesResponse.statusCode, 200);
  assert.deepEqual(garagesResponse.json, { ok: 'getAllGarages-controller' });

  const createGarageResponse = await requestJson(server, 'POST', '/api/v1/admin/garages', {
    name: 'Garage New',
    address: '123 Street',
    phone: '0909'
  });
  assert.equal(createGarageResponse.statusCode, 200);
  assert.deepEqual(createGarageResponse.json, { ok: 'createGarage-controller' });

  const updateGarageResponse = await requestJson(server, 'PUT', '/api/v1/admin/garages/3', {
    name: 'Garage Updated',
    is_active: true
  });
  assert.equal(updateGarageResponse.statusCode, 200);
  assert.deepEqual(updateGarageResponse.json, { ok: 'updateGarage-controller' });

  const bookingsResponse = await requestJson(server, 'GET', '/api/v1/admin/bookings');
  assert.equal(bookingsResponse.statusCode, 200);
  assert.deepEqual(bookingsResponse.json, { ok: 'getAllBookings-controller' });

  const updateStatusResponse = await requestJson(server, 'PATCH', '/api/v1/admin/bookings/9/status', {
    status: 'CONFIRMED'
  });
  assert.equal(updateStatusResponse.statusCode, 200);
  assert.deepEqual(updateStatusResponse.json, { ok: 'updateBookingStatus-controller' });

  assert.equal(calls.getAllGarages, 1);
  assert.equal(calls.createGarage, 1);
  assert.equal(calls.updateGarage, 1);
  assert.equal(calls.getAllBookings, 1);
  assert.equal(calls.updateBookingStatus, 1);

  assert.deepEqual(capturedCreateGarageBody, {
    name: 'Garage New',
    address: '123 Street',
    phone: '0909'
  });
  assert.deepEqual(capturedUpdateGarage, {
    id: '3',
    body: {
      name: 'Garage Updated',
      is_active: true
    }
  });
  assert.deepEqual(capturedUpdateBookingStatus, {
    id: '9',
    status: 'CONFIRMED'
  });
});
