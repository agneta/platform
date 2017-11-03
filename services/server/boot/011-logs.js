const Tail = require('./logs/tail');

module.exports = function(app) {

  var options = app.get('options');
  var logs = app.logs = {};

  return require('./logs/rotate')(app)
    .then(function() {
      logs.output = Tail(logs.file.output);
      logs.error = Tail(logs.file.error);

      if (!options.disableLogWatch) {

        logs.output.watch();
        logs.error.watch();

      }

    });
};
