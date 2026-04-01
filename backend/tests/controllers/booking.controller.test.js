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

test('booking routes expose garage list and create booking contract', async (t) => {
  const bookingController = {
    getAllGarages: async (req, res) => {
      res.json([{ id: 1, name: 'Garage A' }]);
    },
    createBooking: async (req, res) => {
      res.status(201).json({ message: 'Đặt lịch thành công', id: 45 });
    },
    getMyBookings: async (req, res) => {
      res.json([]);
    }
  };

  const auth = {
    verifyToken: (req, res, next) => {
      req.user = { id: 99 };
      next();
    }
  };

  const router = loadWithMocks('../../routes/booking.routes.js', {
    '../controllers/booking.controller': bookingController,
    '../middlewares/auth': auth
  });

  const app = express();
  app.use(express.json());
  app.use('/api/v1/bookings', router);
  const server = app.listen(0);
  t.after(() => server.close());

  const garagesResponse = await requestJson(server, 'GET', '/api/v1/bookings/garages');
  assert.equal(garagesResponse.statusCode, 200);
  assert.deepEqual(garagesResponse.json, [{ id: 1, name: 'Garage A' }]);

  const createResponse = await requestJson(server, 'POST', '/api/v1/bookings', {
    orderId: 10,
    garageId: 1,
    bookingDate: '2026-01-01',
    notes: 'Morning'
  });

  assert.equal(createResponse.statusCode, 201);
  assert.deepEqual(createResponse.json, {
    message: 'Đặt lịch thành công',
    id: 45
  });
});

test('createBooking passes req.user.id and req.body to bookingModel.createBooking', async () => {
  let receivedCreatePayload;
  const bookingModel = {
    createBooking: async (payload) => {
      receivedCreatePayload = payload;
      return { insertId: 45 };
    },
    getAllGarages: async () => [],
    getUserBookings: async () => []
  };

  const { createBooking } = loadWithMocks('../../controllers/booking.controller.js', {
    '../models/booking.model': bookingModel
  });

  const response = createResponse();
  await createBooking({
    user: { id: 99 },
    body: {
      orderId: 10,
      garageId: 1,
      bookingDate: '2026-01-01',
      notes: 'Morning'
    }
  }, response);

  assert.deepEqual(receivedCreatePayload, {
    userId: 99,
    orderId: 10,
    garageId: 1,
    bookingDate: '2026-01-01',
    notes: 'Morning'
  });
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.body, {
    message: 'Đặt lịch thành công',
    id: 45
  });
});
