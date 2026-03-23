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

test('getSearchHistory parses JSON filters from search history model results', async () => {
  let receivedArgs;
  const searchHistoryModel = {
    findSearchHistoryByUser: async (...args) => {
      receivedArgs = args;
      return [{ id: 4, filters: '{"category_id":2}' }];
    }
  };

  const { getSearchHistory } = loadWithMocks('../../src/controllers/searchHistory.controller.js', {
    '../models/searchHistory.model': searchHistoryModel
  });

  const response = createResponse();

  await getSearchHistory({ user: { id: 9 }, query: { limit: '20', search_type: 'keyword' } }, response);

  assert.deepEqual(receivedArgs, [9, 'keyword', 20]);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: [{ id: 4, filters: { category_id: 2 } }]
  });
});
