const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('vin model findWmiMapping queries WMI mapping with joined brand data', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ brand_id: 3, brand_name: 'Honda' }]];
    }
  };

  const vinModel = loadWithMocks('../../src/models/vin.model.js', {
    '../config/db': db
  });

  const result = await vinModel.findWmiMapping('1HG');

  assert.equal(calls[0][1][0], '1HG');
  assert.match(calls[0][0], /FROM vin_wmi_mappings vwm/);
  assert.deepEqual(result, [{ brand_id: 3, brand_name: 'Honda' }]);
});
