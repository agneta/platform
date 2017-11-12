const _ = require('lodash');

module.exports = function(app) {

  function authCheck(ctx) {

    var Activity_Feed = ctx.method.ctor.getModel('Activity_Feed');
    var auth = _.get(app.get('activity'), 'auth');
    var req = ctx.req;

    var params = req.query || req.body;

    //console.log('activity_count:authCheck:auth', auth);
    //console.log('activity_count:authCheck:params', params);

    return Promise.resolve()
      .then(function() {

        if (params.feed) {
          return Activity_Feed.findById(params.feed, {
            fields: {
              type: true
            }
          })
            .then(function(feed) {
              if (!feed) {
                return Promise.reject({
                  statusCode: 401,
                  message: `Could not find feed ${params.feed}`
                });
              }
              return feed.type;
            });
        }

        return params.type;
      })
      .then(function(type) {

        //console.log('activity_count:authCheck:type', type);

        var allowRoles = ['administrator'];

        if (type) {
          allowRoles = allowRoles.concat(auth.allow[type]);
        }
        return app.models.Account.hasRoles(allowRoles, req);
      })
      .then(function(result) {
        console.log(result);
        if (!result.has) {
          return Promise.reject({
            statusCode: 401,
            message: result.message
          });
        }
      });
  }

  app.activity = {
    authCheck: authCheck
  };

};
