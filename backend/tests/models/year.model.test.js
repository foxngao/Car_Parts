const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('year model compatibility query joins parts and categories ordered by part name', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 9, name: 'Oil Filter', category_name: 'Filters' }]];
    }
  };

  const yearModel = loadWithMocks('../../src/models/year.model.js', {
    '../config/db': db
  });

  const result = await yearModel.findPartsByModelYearId(7);

  assert.deepEqual(calls, [[
    `SELECT p.*, c.name as category_name
       FROM parts p
       JOIN part_compatibility pc ON p.id = pc.part_id
       JOIN categories c ON p.category_id = c.id
       WHERE pc.model_year_id = ?
       ORDER BY p.name`,
    [7]
  ]]);
  assert.deepEqual(result, [{ id: 9, name: 'Oil Filter', category_name: 'Filters' }]);
});
