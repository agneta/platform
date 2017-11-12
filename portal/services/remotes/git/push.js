module.exports = function(Model, app) {


  Model.push = function(message, req) {
    return app.git.push(message, req)
      .then(function(result) {

        app.models.Account.activity({
          req: req,
          action: 'git_push',
          data: {
            message: message,
            commit: result.commit
          }
        });

      });
  };

  Model.remoteMethod(
    'push', {
      description: 'Commit and push GIT changes',
      accepts: [{
        arg: 'message',
        type: 'string',
        required: true
      },
      {
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }
      ],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/push'
      }
    }
  );

};
