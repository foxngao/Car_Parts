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

test('getComboDetails returns 404 when combo model cannot find combo info', async () => {
  let receivedArgs;
  const comboModel = {
    findComboById: async (...args) => {
      receivedArgs = args;
      return [];
    }
  };

  const controller = loadWithMocks('../../controllers/combo.controller.js', {
    '../models/combo.model': comboModel
  });

  const response = createResponse();

  await controller.getComboDetails({ params: { id: '12' } }, response);

  assert.deepEqual(receivedArgs, ['12']);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Không tìm thấy combo'
  });
});
