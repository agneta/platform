module.exports = function(Model) {


  Model.sshRemove = function(accountId,keyId) {

    return Model.__get(accountId)
      .then(function(account) {
        return account.sshKeys.findById(keyId);
      })
      .then(function(key) {
        if(!key){
          return Promise.reject({
            message: 'SSH Key not found',
            statusCode: 401
          });
        }
        return key.destroy();
      })
      .then(function(){
        return {
          success: 'SSH Key removed from account'
        };
      });

  };

  Model.remoteMethod(
    'sshRemove', {
      description: 'Remove SSH Key from account',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      },{
        arg: 'keyId',
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
        path: '/ssh-remove'
      }
    }
  );

};
