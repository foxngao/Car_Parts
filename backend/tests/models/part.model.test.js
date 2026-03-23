const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('part model deletePartById deletes part by id', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [{ affectedRows: 0 }];
    }
  };

  const partModel = loadWithMocks('../../src/models/part.model.js', {
    '../config/db': db
  });

  const result = await partModel.deletePartById(15);

  assert.deepEqual(calls, [[
    'DELETE FROM parts WHERE id = ?',
    [15]
  ]]);
  assert.deepEqual(result, { affectedRows: 0 });
});
