module.exports = function(Model, app) {

  Model.servers = function() {

    return app.models.Process_Server.find({
      include: 'processes'
    })
      .then(function(result) {
        console.log(result);
        return {
          list: result
        };
      });

  };

  Model.remoteMethod(
    'servers', {
      description: 'Get process servers',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/servers'
      }
    }
  );

};
