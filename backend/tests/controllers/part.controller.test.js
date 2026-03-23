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

test('deletePart returns 404 when part model deletes no row', async () => {
  let receivedArgs;
  const partModel = {
    deletePartById: async (...args) => {
      receivedArgs = args;
      return { affectedRows: 0 };
    }
  };

  const { deletePart } = loadWithMocks('../../src/controllers/part.controller.js', {
    '../models/part.model': partModel
  });

  const response = createResponse();

  await deletePart({ params: { id: '15' } }, response);

  assert.deepEqual(receivedArgs, ['15']);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Part not found'
  });
});
