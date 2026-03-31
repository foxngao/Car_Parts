const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('compare model findPartsByIds queries parts with category names for placeholders', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 1, category_name: 'Engine' }]];
    }
  };

  const compareModel = loadWithMocks('../../models/compare.model.js', {
    '../config/db': db
  });

  const result = await compareModel.findPartsByIds([1, 2]);

  assert.match(calls[0][0], /WHERE p.id IN \(\?,\?\)/);
  assert.deepEqual(calls[0][1], [1, 2]);
  assert.deepEqual(result, [{ id: 1, category_name: 'Engine' }]);
});
