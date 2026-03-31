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

test('searchByImage returns empty results when imageSearch model receives no search conditions', async () => {
  let receivedArgs;
  const imageSearchModel = {
    buildImageSearchQueryData: (...args) => {
      receivedArgs = args;
      return {
      imageUrl: null,
      description: '',
      countQuery: null,
      countParams: [],
      searchQuery: null,
      searchParams: []
      };
    }
  };

  const { searchByImage } = loadWithMocks('../../controllers/imageSearch.controller.js', {
    '../models/imageSearch.model': imageSearchModel
  });

  const response = createResponse();

  await searchByImage({
    body: { description: '  ', page: '2', limit: '5' },
    file: { filename: 'search-test.png', originalname: 'search-test.png' },
    protocol: 'http',
    get: () => 'localhost:3000'
  }, response);

  assert.equal(receivedArgs[0].page, 2);
  assert.equal(receivedArgs[0].limit, 5);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: {
      uploaded_image: null,
      description: '',
      parts: [],
      pagination: { page: 2, limit: 5, total: 0, totalPages: 0 }
    }
  });
});
