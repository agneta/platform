module.exports = function(Model) {

  Model.ipList = function(accountId) {

    return Promise.resolve()
      .then(function() {

        return Model.getModel('Account').__get(accountId);

      })
      .then(function(account) {

        return account.ip_whitelist();

      })
      .then(function(result){
        return {
          list: result
        };
      });

  };

  Model.remoteMethod(
    'ipList', {
      description: 'Add an IP to whitelist when loging in',
      accepts: [{
        arg: 'accountId',
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
        path: '/ip-list'
      }
    }
  );

};
