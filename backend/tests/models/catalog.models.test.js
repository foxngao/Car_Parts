const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('brand model findAll queries brands ordered by name', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 1, name: 'Toyota' }]];
    }
  };

  const brandModel = loadWithMocks('../../src/models/brand.model.js', {
    '../config/db': db
  });

  const result = await brandModel.findAll();

  assert.deepEqual(calls, [['SELECT * FROM brands ORDER BY name']]);
  assert.deepEqual(result, [{ id: 1, name: 'Toyota' }]);
});

test('model model findByBrandId queries car_models by brand id', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 3, brand_id: 5, name: 'Accord' }]];
    }
  };

  const modelModel = loadWithMocks('../../src/models/model.model.js', {
    '../config/db': db
  });

  const result = await modelModel.findByBrandId(5);

  assert.deepEqual(calls, [[
    'SELECT * FROM car_models WHERE brand_id = ? ORDER BY name',
    [5]
  ]]);
  assert.deepEqual(result, [{ id: 3, brand_id: 5, name: 'Accord' }]);
});

test('model model findByModelId queries years descending', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 8, model_id: 2, year: 2025 }]];
    }
  };

  const modelModel = loadWithMocks('../../src/models/model.model.js', {
    '../config/db': db
  });

  const result = await modelModel.findByModelId(2);

  assert.deepEqual(calls, [[
    'SELECT * FROM model_years WHERE model_id = ? ORDER BY year DESC',
    [2]
  ]]);
  assert.deepEqual(result, [{ id: 8, model_id: 2, year: 2025 }]);
});
