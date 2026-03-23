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

test('getCompatibleParts returns data from year model', async () => {
  let receivedModelYearId;
  const yearModel = {
    findPartsByModelYearId: async (modelYearId) => {
      receivedModelYearId = modelYearId;
      return [{ id: 5, name: 'Brake Pad', category_name: 'Brakes' }];
    }
  };

  const { getCompatibleParts } = loadWithMocks('../../src/controllers/year.controller.js', {
    '../models/year.model': yearModel
  });

  const response = createResponse();

  await getCompatibleParts({ params: { id: '33' } }, response);

  assert.equal(receivedModelYearId, '33');
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: [{ id: 5, name: 'Brake Pad', category_name: 'Brakes' }]
  });
});
