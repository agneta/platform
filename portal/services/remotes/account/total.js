var _ = require('lodash');

module.exports = function(Model, app) {

  Model.total = function() {

      return Model.count({})
          .then(function(count) {
              return {
                  count: count
              };
          });

  };

  Model.remoteMethod(
      'total', {
          description: 'Get number of accounts created',
          accepts: [],
          returns: {
              arg: 'result',
              type: 'object',
              root: true
          },
          http: {
              verb: 'get',
              path: '/total'
          },
      }
  );
  
};
