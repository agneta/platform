module.exports = function(Model) {

  Model.certList = function(accountId) {

    return Promise.resolve()
      .then(function() {

        return Model.getModel('Account').__get(accountId);

      })
      .then(function(account) {

        return account.cert.find();

      })
      .then(function(result){
        return {
          list: result
        };
      });

  };

  Model.remoteMethod(
    'certList', {
      description: 'List the certificates of a specified account',
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
        path: '/cert-list'
      }
    }
  );

};
