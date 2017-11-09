const Promise = require('bluebird');
const pm2 = Promise.promisifyAll(require('pm2'));

module.exports = function(app) {

  if (app.get('options').web) {
    return;
  }

  var processName = 'agneta';

  app.process = {
    describe: function() {
      return pm2.describeAsync(processName);
    },
    restart: function() {
      return pm2.restartAsync(processName);
    }
  };


  return Promise.resolve()

    .then(function() {
      return require('./process/git')(app);
    })

    .then(function() {
      return require('./process/init')(app);
    })

    .then(function() {
      return require('./process/logs')(app);
    });



};
