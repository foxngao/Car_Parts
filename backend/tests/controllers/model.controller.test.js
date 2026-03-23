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

test('getYearsByModel returns data from modelYear model', async () => {
  let receivedModelId;
  const modelYearModel = {
    findByModelId: async (modelId) => {
      receivedModelId = modelId;
      return [{ id: 1, model_id: 12, year: 2024 }];
    }
  };

  const { getYearsByModel } = loadWithMocks('../../src/controllers/model.controller.js', {
    '../models/model.model': {},
    '../models/modelYear.model': modelYearModel
  });

  const response = createResponse();

  await getYearsByModel({ params: { id: '12' } }, response);

  assert.equal(receivedModelId, '12');
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: [{ id: 1, model_id: 12, year: 2024 }]
  });
});

test('updateModel returns 404 when model layer reports no affected rows', async () => {
  const modelModel = {
    updateModelById: async () => ({ affectedRows: 0 })
  };

  const { updateModel } = loadWithMocks('../../src/controllers/model.controller.js', {
    '../models/model.model': modelModel,
    '../models/modelYear.model': {}
  });

  const response = createResponse();

  await updateModel({ params: { id: '7' }, body: { brand_id: 2, name: 'Camry' } }, response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Model not found'
  });
});

test('createModelYear maps duplicate errors to 409', async () => {
  const duplicateError = new Error('duplicate');
  duplicateError.code = 'ER_DUP_ENTRY';

  const modelYearModel = {
    createModelYear: async () => {
      throw duplicateError;
    }
  };

  const { createModelYear } = loadWithMocks('../../src/controllers/model.controller.js', {
    '../models/model.model': {},
    '../models/modelYear.model': modelYearModel
  });

  const response = createResponse();

  await createModelYear({ body: { model_id: 10, year: 2023 } }, response);

  assert.equal(response.statusCode, 409);
  assert.deepEqual(response.body, {
    success: false,
    message: 'This model year already exists'
  });
});
