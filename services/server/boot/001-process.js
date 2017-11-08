const Promise = require('bluebird');
const pm2 = Promise.promisifyAll(require('pm2'));

module.exports = function(app) {

  var processName = 'agneta';

  app.process = {
    describe: function() {
      return pm2.describeAsync(processName);
    },
    restart: function(){
      return pm2.restartAsync(processName);
    }
  };

};
