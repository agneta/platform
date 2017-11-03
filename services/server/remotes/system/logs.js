module.exports = function(Model, app) {

  if (!app.get('options').disableLogWatch) {

    var logNames = ['output', 'error'];
    for (var name of logNames) {
      var log = app.logs[name];
      log.events.on('change', function(result) {
        Model.io.emit(`logs:change:${name}`, result);
      });
    }

  }

  Model.logs = function(name) {

    var log = app.logs[name];

    if (!log) {
      return Promise.reject({
        statusCode: 400,
        message: 'The name of the log is invalid'
      });
    }

    return Promise.resolve()
      .then(function() {

        return log.readLast();

      })
      .then(function(entries) {

        return {
          entries: entries
        };

      });

  };

  Model.remoteMethod(
    'logs', {
      description: 'Get application logs',
      accepts: [{
        arg: 'name',
        type: 'string',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/logs'
      }
    }
  );

};
