const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('review model findReviewSummaryByPartId queries summary aggregates', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ review_count: 2 }]];
    }
  };

  const reviewModel = loadWithMocks('../../models/review.model.js', {
    '../config/db': db
  });

  const result = await reviewModel.findReviewSummaryByPartId(6);

  assert.equal(calls[0][1][0], 6);
  assert.match(calls[0][0], /AVG\(rating\)/);
  assert.deepEqual(result, [{ review_count: 2 }]);
});

test('review model findReviewById queries part_reviews by id', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 4, user_id: 99 }]];
    }
  };

  const reviewModel = loadWithMocks('../../models/review.model.js', {
    '../config/db': db
  });

  const result = await reviewModel.findReviewById(4);

  assert.deepEqual(calls, [[
    'SELECT * FROM part_reviews WHERE id = ?',
    [4]
  ]]);
  assert.deepEqual(result, [{ id: 4, user_id: 99 }]);
});
