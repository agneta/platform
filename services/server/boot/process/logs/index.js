const Tail = require('./tail');
const Promise = require('bluebird');

module.exports = function(app) {

  var logs = app.process.logs = {};
  var names = ['output', 'error'];

  return require('./rotate')(app)
    .then(function() {

      return Promise.map(names, function(name) {
        var log = Tail(logs.file[name]);
        log.watch();

        log.emitter.on('change', function(result) {
          if (!app.models.Process.io) {
            return;
          }
          app.models.Process.io.emit(`logs:change:${name}`, result);
        });

        logs[name] = log;
      });


    });
};
