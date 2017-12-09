const module = require('module');
module.exports = function() {

  var app = {
    version: {}
  };

  require('./update')(app);

  return require('./init')(app);

};
