module.exports = function(Model) {

  Model.ipRemove = function(accountId,ipId) {

    return Promise.resolve()
      .then(function() {
        return Model.__get(accountId);
      })
      .then(function(account) {
        return account.ip_whitelist.findById(ipId);
      })
      .then(function(result) {
        if(!result){
          return Promise.reject({
            message: 'IP not found',
            statusCode: 401
          });
        }
        return result.destroy();
      })
      .then(function(){
        return {
          success: 'IP removed from account'
        };
      });

  };

  Model.remoteMethod(
    'ipRemove', {
      description: 'Remove an IP from the account\'s whitelist',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      },{
        arg: 'ipId',
        type: 'string',
        required: true
      }, {
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
        path: '/ip-remove'
      }
    }
  );

};
