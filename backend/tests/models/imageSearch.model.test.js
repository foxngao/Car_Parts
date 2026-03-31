const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('imageSearch model findPartsByImageSearch queries ranked part results with supplied params', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 11, relevance_score: 8 }]];
    }
  };

  const imageSearchModel = loadWithMocks('../../models/imageSearch.model.js', {
    '../config/db': db
  });

  const result = await imageSearchModel.findPartsByImageSearch(
    'SELECT DISTINCT p.*, 8 as relevance_score FROM parts p LIMIT ? OFFSET ?',
    [12, 0]
  );

  assert.deepEqual(calls, [[
    'SELECT DISTINCT p.*, 8 as relevance_score FROM parts p LIMIT ? OFFSET ?',
    [12, 0]
  ]]);
  assert.deepEqual(result, [{ id: 11, relevance_score: 8 }]);
});
