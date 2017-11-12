module.exports = function(Model, app) {

  Model.status = function() {
    return app.git.status()
      .then(function(files) {
        return {
          files: files
        };
      });
  };

  Model.remoteMethod(
    'status', {
      description: 'Get GIT Status',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/status'
      }
    }
  );

};
