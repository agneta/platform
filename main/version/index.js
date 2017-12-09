const path = require('path');
module.exports = function() {

  var app = {
    version: {},
    config: require(
      path.join(process.cwd(),'services/config')
    ).git
  };

  require('./update')(app);

  return require('./init')(app);

};
