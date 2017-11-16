const configstore = require('configstore');
const path = require('path');
const S = require('string');

module.exports = function(app) {

  var pkg = require(
    path.join(process.cwd(), 'package.json')
  );

  var name = pkg.name || path.parse(process.cwd()).name;
  name = S(name).slugify().replaceAll('-', '_').s;

  app.configstore = new configstore(
    path.join('agneta', name), {}
  );

};
