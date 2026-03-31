const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..', '..');

test('root-level shared infrastructure files exist', () => {
  assert.equal(fs.existsSync(path.join(backendRoot, 'config', 'db.js')), true);
  assert.equal(fs.existsSync(path.join(backendRoot, 'middlewares', 'auth.js')), true);
  assert.equal(fs.existsSync(path.join(backendRoot, 'middlewares', 'validate.js')), true);
});

test('legacy src config shim is removed in finalized monolithic layout', () => {
  assert.equal(fs.existsSync(path.join(backendRoot, 'src', 'config', 'db.js')), false);
});

test('root middleware shims point to local finalized utility modules', () => {
  const authSrc = fs.readFileSync(path.join(backendRoot, 'middlewares', 'auth.js'), 'utf8');
  const validateSrc = fs.readFileSync(path.join(backendRoot, 'middlewares', 'validate.js'), 'utf8');

  assert.match(authSrc, /module\.exports\s*=\s*require\('\.\.\/utils\/auth'\)/);
  assert.match(validateSrc, /module\.exports\s*=\s*require\('\.\.\/utils\/validate'\)/);
});

test('legacy src model shims are removed in finalized monolithic layout', () => {
  assert.equal(fs.existsSync(path.join(backendRoot, 'src', 'models', 'admin.model.js')), false);
});
