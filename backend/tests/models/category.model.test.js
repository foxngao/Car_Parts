const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('category model updateCategoryById updates category name by id', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [{ affectedRows: 0 }];
    }
  };

  const categoryModel = loadWithMocks('../../src/models/category.model.js', {
    '../config/db': db
  });

  const result = await categoryModel.updateCategoryById(7, 'Engine');

  assert.deepEqual(calls, [[
    'UPDATE categories SET name = ? WHERE id = ?',
    ['Engine', 7]
  ]]);
  assert.deepEqual(result, { affectedRows: 0 });
});
