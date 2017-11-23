var Promise = require('bluebird');
var _ = require('lodash');

module.exports = function(Model, app) {

  Model.clearLimits = function(req) {

    return Promise.map(_.keys(app.locals.limiters), function(name) {
      var limiter = app.locals.limiters[name];
      return new Promise(function(resolve, reject) {

        limiter.reset(req.ip, null, function(err) {
          if(err){
            reject(err);
          }
          resolve();
        });

      });

    })
      .then(function(){
        return {
          success: 'All Limits are now cleared'
        };
      });

  };

  Model.remoteMethod(
    'clearLimits', {
      description: 'Clear account limits',
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
        path: '/clear-limits'
      }
    }
  );


};
