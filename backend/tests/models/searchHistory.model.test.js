const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('searchHistory model findSearchHistoryByUser queries user history filtered by type and limit', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 4, filters: null }]];
    }
  };

  const searchHistoryModel = loadWithMocks('../../models/searchHistory.model.js', {
    '../config/db': db
  });

  const result = await searchHistoryModel.findSearchHistoryByUser(9, 'keyword', 20);

  assert.match(calls[0][0], /WHERE user_id = \? AND search_type = \?/);
  assert.match(calls[0][0], /LIMIT \?/);
  assert.deepEqual(calls[0][1], [9, 'keyword', 20]);
  assert.deepEqual(result, [{ id: 4, filters: null }]);
});
