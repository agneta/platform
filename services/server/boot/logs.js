const Tail = require('./logs/tail');

module.exports = function(app) {

  var logs = app.logs = {};

  return require('./logs/rotate')(app)
    .then(function() {
      logs.output = Tail(logs.file.output);
      logs.error = Tail(logs.file.error);
    });
};
