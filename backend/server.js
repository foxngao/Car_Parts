const app = require('./app');

module.exports = app;

if (require.main === module) {
  require('./bin/www');
}
