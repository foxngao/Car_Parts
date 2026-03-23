const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

const createResponse = () => {
  const response = {
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
  };

  return response;
};

test('getAllBrands returns data from brand model', async () => {
  const brandModel = {
    findAll: async () => [{ id: 1, name: 'Toyota' }]
  };

  const { getAllBrands } = loadWithMocks('../../src/controllers/brand.controller.js', {
    '../models/brand.model': brandModel,
    '../models/model.model': {}
  });

  const response = createResponse();

  await getAllBrands({}, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: [{ id: 1, name: 'Toyota' }]
  });
});

test('getModelsByBrand loads models through model model', async () => {
  let receivedBrandId;
  const modelModel = {
    findByBrandId: async (brandId) => {
      receivedBrandId = brandId;
      return [{ id: 4, brand_id: 9, name: 'Civic' }];
    }
  };

  const { getModelsByBrand } = loadWithMocks('../../src/controllers/brand.controller.js', {
    '../models/brand.model': {},
    '../models/model.model': modelModel
  });

  const response = createResponse();

  await getModelsByBrand({ params: { id: '9' } }, response);

  assert.equal(receivedBrandId, '9');
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: [{ id: 4, brand_id: 9, name: 'Civic' }]
  });
});

test('createBrand maps duplicate errors to 409', async () => {
  const duplicateError = new Error('duplicate');
  duplicateError.code = 'ER_DUP_ENTRY';

  const brandModel = {
    createBrand: async () => {
      throw duplicateError;
    }
  };

  const { createBrand } = loadWithMocks('../../src/controllers/brand.controller.js', {
    '../models/brand.model': brandModel,
    '../models/model.model': {}
  });

  const response = createResponse();

  await createBrand({ body: { name: 'Toyota', country: 'Japan' } }, response);

  assert.equal(response.statusCode, 409);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Brand already exists'
  });
});
