const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('combo model findComboById queries combo part details by id', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 12, is_combo: 1 }]];
    }
  };

  const comboModel = loadWithMocks('../../src/models/combo.model.js', {
    '../config/db': db
  });

  const result = await comboModel.findComboById(12);

  assert.equal(calls[0][1][0], 12);
  assert.match(calls[0][0], /WHERE p.id = \? AND p.is_combo = TRUE/);
  assert.deepEqual(result, [{ id: 12, is_combo: 1 }]);
});
