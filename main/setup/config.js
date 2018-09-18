const path = require('path');

var config = require(
  path.join(
    process.cwd(),
    'services/config'
  )).git;


module.exports = config;
