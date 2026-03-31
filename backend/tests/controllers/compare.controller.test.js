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

test('getCompareData returns 404 when compare model finds no products', async () => {
  let receivedArgs;
  const compareModel = {
    findPartsByIds: async (...args) => {
      receivedArgs = args;
      return [];
    }
  };

  const { getCompareData } = loadWithMocks('../../controllers/compare.controller.js', {
    '../models/compare.model': compareModel
  });

  const response = createResponse();

  await getCompareData({ query: { ids: '1,2' } }, response);

  assert.deepEqual(receivedArgs, [[1, 2]]);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'No products found'
  });
});
