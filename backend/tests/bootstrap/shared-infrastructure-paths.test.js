const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..', '..');

test('root-level shared infrastructure files exist', () => {
  assert.equal(fs.existsSync(path.join(backendRoot, 'config', 'db.js')), true);
  assert.equal(fs.existsSync(path.join(backendRoot, 'utils', 'auth.js')), true);
  assert.equal(fs.existsSync(path.join(backendRoot, 'utils', 'validate.js')), true);
});

test('legacy db module is a compatibility shim to root config', () => {
  const src = fs.readFileSync(path.join(backendRoot, 'src', 'config', 'db.js'), 'utf8');
  assert.match(src, /module\.exports\s*=\s*require\('\.\.\/\.\.\/config\/db'\)/);
});

test('legacy middleware modules are compatibility shims to root utils', () => {
  const authSrc = fs.readFileSync(path.join(backendRoot, 'src', 'middlewares', 'auth.js'), 'utf8');
  const validateSrc = fs.readFileSync(path.join(backendRoot, 'src', 'middlewares', 'validate.js'), 'utf8');

  assert.match(authSrc, /module\.exports\s*=\s*require\('\.\.\/\.\.\/utils\/auth'\)/);
  assert.match(validateSrc, /module\.exports\s*=\s*require\('\.\.\/\.\.\/utils\/validate'\)/);
});
