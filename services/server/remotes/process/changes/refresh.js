module.exports = function(Model, app) {

  var config = app.get('git');

  Model.changesRefresh = function() {

    var branchName = app.process.git.branch.current;

    return app.process.git.native.fetch(config.remote.name, branchName)
      .then(function(result) {
        return {
          success: `Fetched changes from remote ${result.remote} on branch ${branchName}`
        };
      });
  };



  Model.remoteMethod(
    'changesRefresh', {
      description: '',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/changes-refresh'
      }
    }
  );

};
