module.exports = function(Model, app) {

  var config = app.get('git');

  Model.fetch = function() {

    var branchName = app.git.branch.current;

    return app.git.native.fetch(config.remote.name, branchName)
      .then(function(result) {
        return {
          success: `Fetched commit from remote ${result.remote} on branch ${branchName}`
        };
      });
  };



  Model.remoteMethod(
    'fetch', {
      description: '',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/fetch'
      }
    }
  );

};
