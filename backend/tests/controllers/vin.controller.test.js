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

test('decodeVin returns 404 when vin model cannot find WMI mapping', async () => {
  let receivedArgs;
  const vinModel = {
    findWmiMapping: async (...args) => {
      receivedArgs = args;
      return [];
    }
  };

  const { decodeVin } = loadWithMocks('../../controllers/vin.controller.js', {
    '../models/vin.model': vinModel
  });

  const response = createResponse();

  await decodeVin({ params: { vin: '1HGCM82633A123456' } }, response);

  assert.deepEqual(receivedArgs, ['1HG']);
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Không tìm thấy thông tin hãng xe cho mã WMI "1HG".',
    data: { vin: '1HGCM82633A123456', wmi: '1HG' }
  });
});
