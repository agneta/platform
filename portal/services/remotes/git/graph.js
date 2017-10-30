const S = require('string');

module.exports = function(Model, app) {

  var config = app.get('git');

  Model.graph = function() {
    console.log(app.git.branch);

    var branchName = app.git.branch.current;
    var remoteBranch = `${config.remote.name}/${branchName}`;
    var behind;
    var ahead;

    return Promise.resolve()
      .then(function() {
        return app.git.native.raw(['rev-list','--left-right','--count',`${remoteBranch}...${branchName}`]);
      })
      .then(function(commitCount) {
        commitCount = S(commitCount).strip('\n').s.split('\t');
        behind = parseFloat(commitCount[0]);
        ahead = parseFloat(commitCount[1]);
        return app.git.native.log(['--max-count', '3', '--remotes', remoteBranch]);

      })
      .then(function(remoteLog) {
        return{
          behind: behind,
          ahead: ahead,
          shortLog: remoteLog.all
        };
      });
  };



  Model.remoteMethod(
    'graph', {
      description: '',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/graph'
      }
    }
  );

};
