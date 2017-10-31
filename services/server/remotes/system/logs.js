module.exports = function(Model, app) {

  Model.logs = function() {

    return Promise.resolve()
      .then(function() {

        return app.logs.output.readLast();

      })
      .then(function(lines) {

        return {
          lines: lines
        };

      });

  };

  Model.remoteMethod(
    'logs', {
      description: 'Get application logs',
      accepts: [],
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
