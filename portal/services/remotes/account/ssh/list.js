module.exports = function(Model) {

  Model.sshList = function(accountId) {

    return Model.__get(accountId)
      .then(function(account) {
        return account.ssh();
      })
      .then(function(keys) {
        return {
          keys: keys
        };
      });

  };

  Model.remoteMethod(
    'sshList', {
      description: 'Activate Account with given ID',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/ssh-list'
      }
    }
  );

};
