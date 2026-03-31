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

test('getFavorites returns data from favorite model', async () => {
  let receivedUserId;
  const favoriteModel = {
    findFavoritesByUserId: async (userId) => {
      receivedUserId = userId;
      return [{ id: 1, name: 'Brake Pad' }];
    }
  };

  const { getFavorites } = loadWithMocks('../../controllers/favorite.controller.js', {
    '../models/favorite.model': favoriteModel
  });

  const response = createResponse();

  await getFavorites({ user: { id: 4 } }, response);

  assert.equal(receivedUserId, 4);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: [{ id: 1, name: 'Brake Pad' }]
  });
});

test('toggleFavorite removes favorite when model reports an existing row', async () => {
  let removedArgs;
  const favoriteModel = {
    findFavoriteByUserAndPart: async () => [{ id: 3 }],
    deleteFavoriteByUserAndPart: async (...args) => {
      removedArgs = args;
    }
  };

  const { toggleFavorite } = loadWithMocks('../../controllers/favorite.controller.js', {
    '../models/favorite.model': favoriteModel
  });

  const response = createResponse();

  await toggleFavorite({ user: { id: 4 }, body: { partId: 9 } }, response);

  assert.deepEqual(removedArgs, [4, 9]);
  assert.deepEqual(response.body, {
    success: true,
    isFavorite: false,
    message: 'Đã bỏ yêu thích'
  });
});

test('checkFavorite returns false when favorite model finds no row', async () => {
  const favoriteModel = {
    findFavoriteByUserAndPart: async () => []
  };

  const { checkFavorite } = loadWithMocks('../../controllers/favorite.controller.js', {
    '../models/favorite.model': favoriteModel
  });

  const response = createResponse();

  await checkFavorite({ user: { id: 4 }, params: { partId: '9' } }, response);

  assert.deepEqual(response.body, {
    success: true,
    isFavorite: false
  });
});
