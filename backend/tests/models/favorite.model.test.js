const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/module-loader');

test('favorite model findFavoriteByUserAndPart queries favorite_parts by user and part', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [[{ id: 3 }]];
    }
  };

  const favoriteModel = loadWithMocks('../../src/models/favorite.model.js', {
    '../config/db': db
  });

  const result = await favoriteModel.findFavoriteByUserAndPart(4, 9);

  assert.deepEqual(calls, [[
    'SELECT * FROM favorite_parts WHERE user_id = ? AND part_id = ?',
    [4, 9]
  ]]);
  assert.deepEqual(result, [{ id: 3 }]);
});

test('favorite model insertFavorite creates favorite_parts row', async () => {
  const calls = [];
  const db = {
    query: async (...args) => {
      calls.push(args);
      return [{ insertId: 10 }];
    }
  };

  const favoriteModel = loadWithMocks('../../src/models/favorite.model.js', {
    '../config/db': db
  });

  const result = await favoriteModel.insertFavorite(4, 9);

  assert.deepEqual(calls, [[
    'INSERT INTO favorite_parts (user_id, part_id) VALUES (?, ?)',
    [4, 9]
  ]]);
  assert.deepEqual(result, { insertId: 10 });
});
