const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..', '..');

const readFile = (relativePath) =>
  fs.readFileSync(path.join(backendRoot, relativePath), 'utf8');

test('package scripts use bin/www for start and dev', () => {
  const packageJson = JSON.parse(readFile('package.json'));

  assert.equal(packageJson.scripts.start, 'node bin/www');
  assert.equal(packageJson.scripts.dev, 'nodemon bin/www');
});

test('dockerfile copies monolithic runtime layout and starts bin/www', () => {
  const dockerfile = readFile('Dockerfile');

  assert.match(dockerfile, /^COPY app\.js \.\/$/m);
  assert.match(dockerfile, /^COPY bin \.\/bin$/m);
  assert.match(dockerfile, /^COPY server\.js \.\/$/m);
  assert.match(dockerfile, /^COPY src \.\/src$/m);
  assert.match(dockerfile, /^COPY uploads \.\/uploads$/m);
  assert.match(dockerfile, /^CMD \["node", "bin\/www"\]$/m);
});

test('docker compose app command uses nodemon bin/www', () => {
  const compose = readFile('docker-compose.yml');

  assert.match(compose, /^\s*command:\s*npx nodemon bin\/www$/m);
});
