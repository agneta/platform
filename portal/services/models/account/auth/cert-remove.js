module.exports = function(Model) {

  Model.certRemove = function(accountId,certId) {

    return Promise.resolve()
      .then(function() {
        return Model.__get(accountId);
      })
      .then(function(account) {
        return account.cert.findById(certId);
      })
      .then(function(result) {
        if(!result){
          return Promise.reject({
            message: 'Certificate not found',
            statusCode: 401
          });
        }
        return result.destroy();
      })
      .then(function(){
        return {
          message: 'Certificate removed from account'
        };
      });

  };

  Model.remoteMethod(
    'certRemove', {
      description: 'Remove a certificate from a scpecified account',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      },{
        arg: 'certId',
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
        path: '/cert-remove'
      }
    }
  );

};
