const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const request = (server, pathname) =>
  new Promise((resolve, reject) => {
    const address = server.address();
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: address.port,
        path: pathname,
        method: 'GET'
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });

test('app bootstrap exports an express app preserving root health response', async () => {
  const app = require('../../app');
  assert.equal(typeof app, 'function');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const response = await request(server, '/');
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), {
      message: 'Car Parts API is running 🚗'
    });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});
