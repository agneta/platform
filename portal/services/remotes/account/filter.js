const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(Model) {

  Model.filter = function(options) {

    var count;
    options = _.pick(options, ['emailVerified']);

    if (!_.isUndefined(options.emailVerified)) {
      if (!_.isBoolean(options.emailVerified)) {
        return Promise.reject({
          statusCode: 400,
          message: 'value is not valid: verified'
        });
      }

      if(!options.emailVerified){
        options.emailVerified = {
          neq: true
        };
      }
    }


    return Model.count(options)
      .then(function(_count) {

        count = _count;

        return Model.find({
          where: options,
          limit: 20
        });

      })
      .then(function(result) {
        return{
          accounts: result,
          count: count
        };
      });


  };

  Model.remoteMethod(
    'filter', {
      description: 'Filter accounts by given options',
      accepts: [{
        arg: 'options',
        type: 'object',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/filter'
      }
    }
  );

};
