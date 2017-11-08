module.exports = function(Model, app) {

  Model.restart = function() {

    return app.process.restart()
      .then(function() {
        return {
          message: 'process is restarting'
        };
      });

  };

  Model.remoteMethod(
    'restart', {
      description: 'Restart system',
      accepts: [{
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/restart'
      }
    }
  );

};
