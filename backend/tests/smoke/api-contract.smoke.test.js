const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');

const { loadWithMocks } = require('../helpers/module-loader');

const requestJson = ({ server, method, path: pathname, headers = {}, payload }) => new Promise((resolve, reject) => {
  const address = server.address();
  const body = payload === undefined ? undefined : JSON.stringify(payload);
  const finalHeaders = {
    ...headers,
    ...(body
      ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      : {})
  };

  const req = http.request({
    hostname: '127.0.0.1',
    port: address.port,
    path: pathname,
    method,
    headers: finalHeaders
  }, (res) => {
    let raw = '';
    res.on('data', (chunk) => {
      raw += chunk;
    });
    res.on('end', () => {
      const isJson = (res.headers['content-type'] || '').includes('application/json');
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
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

test('api contract smoke: representative public/protected/upload/static routes', async (t) => {
  const authRoutes = loadWithMocks('../../routes/auth.routes.js', {
    '../controllers/auth.controller': {
      register: (req, res) => res.json({ success: true }),
      verifyOtp: (req, res) => res.json({ success: true }),
      login: (req, res) => res.json({ success: true })
    }
  });

  const partRoutes = loadWithMocks('../../routes/part.routes.js', {
    '../controllers/part.controller': {
      searchParts: (req, res) => {
        res.json({
          success: true,
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        });
      },
      getSuggestions: (req, res) => res.json({ success: true, data: [] }),
      getPartById: (req, res) => res.status(404).json({ success: false, message: 'Part not found' })
    }
  });

  const userRoutes = loadWithMocks('../../routes/user.routes.js', {
    '../controllers/user.controller': {
      getProfile: (req, res) => res.json({ success: true }),
      updateProfile: (req, res) => res.json({ success: true }),
      changePassword: (req, res) => res.json({ success: true })
    }
  });

  const imageSearchRoutes = loadWithMocks('../../routes/imageSearch.routes.js', {
    '../controllers/imageSearch.controller': {
      upload: {
        single: () => (req, res, callback) => {
          callback(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)'));
        }
      },
      searchByImage: (req, res) => res.json({ success: true })
    }
  });

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/user', userRoutes);
  app.use('/api/v1/parts', partRoutes);
  app.use('/api/v1/search', imageSearchRoutes);
  app.get('/', (req, res) => {
    res.json({ message: 'Car Parts API is running 🚗' });
  });

  const server = app.listen(0);
  t.after(() => server.close());

  const healthResponse = await requestJson({ server, method: 'GET', path: '/' });
  assert.equal(healthResponse.statusCode, 200);
  assert.equal(typeof healthResponse.json.message, 'string');

  const loginValidationResponse = await requestJson({
    server,
    method: 'POST',
    path: '/api/v1/auth/login',
    payload: {}
  });
  assert.equal(loginValidationResponse.statusCode, 400);
  assert.deepEqual(loginValidationResponse.json.success, false);
  assert.equal(loginValidationResponse.json.message, 'Validation failed');
  assert.ok(Array.isArray(loginValidationResponse.json.errors));

  const searchPublicResponse = await requestJson({
    server,
    method: 'GET',
    path: '/api/v1/parts/search'
  });
  assert.equal(searchPublicResponse.statusCode, 200);
  assert.deepEqual(searchPublicResponse.json.success, true);

  const protectedResponse = await requestJson({
    server,
    method: 'GET',
    path: '/api/v1/user/profile'
  });
  assert.equal(protectedResponse.statusCode, 401);
  assert.deepEqual(protectedResponse.json, {
    success: false,
    message: 'Access token required'
  });

  const imageUploadErrorResponse = await requestJson({
    server,
    method: 'POST',
    path: '/api/v1/search/image',
    payload: {}
  });
  assert.equal(imageUploadErrorResponse.statusCode, 400);
  assert.deepEqual(imageUploadErrorResponse.json, {
    success: false,
    message: 'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)'
  });

  const staticMissingFileResponse = await requestJson({
    server,
    method: 'GET',
    path: '/uploads/__missing_contract_file__.png'
  });
  assert.equal(staticMissingFileResponse.statusCode, 404);
});
