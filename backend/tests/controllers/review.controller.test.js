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

test('createReview returns 404 when review model cannot find the part', async () => {
  const reviewModel = {
    findPartById: async () => []
  };

  const { createReview } = loadWithMocks('../../src/controllers/review.controller.js', {
    '../models/review.model': reviewModel
  });

  const response = createResponse();

  await createReview({ params: { id: '99' }, user: { id: 7 }, body: { rating: 5, comment: 'ok' } }, response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Product not found'
  });
});

test('updateReview returns 403 when review belongs to another user', async () => {
  const reviewModel = {
    findReviewById: async () => [{ id: 4, user_id: 99 }]
  };

  const { updateReview } = loadWithMocks('../../src/controllers/review.controller.js', {
    '../models/review.model': reviewModel
  });

  const response = createResponse();

  await updateReview({ params: { id: '4' }, user: { id: 7 }, body: { rating: 4, comment: 'x' } }, response);

  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Bạn chỉ có thể sửa đánh giá của mình'
  });
});

test('deleteReview returns 403 when requester is neither owner nor admin', async () => {
  const reviewModel = {
    findReviewById: async () => [{ id: 4, user_id: 99 }]
  };

  const { deleteReview } = loadWithMocks('../../src/controllers/review.controller.js', {
    '../models/review.model': reviewModel
  });

  const response = createResponse();

  await deleteReview({ params: { id: '4' }, user: { id: 7, role: 'user' } }, response);

  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Không có quyền xóa đánh giá này'
  });
});
