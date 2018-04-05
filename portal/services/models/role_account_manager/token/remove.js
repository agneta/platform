module.exports = function(Model) {


  Model.tokenRemove = function(tokenId) {

    return Model.getModel('AccountToken')
      .findById(tokenId)
      .then(function(token) {

        if(!token){
          return Promise.reject({
            statusCode: 401,
            message: 'Token not found'
          });
        }
        return token.destroy();

      });
  };

  Model.remoteMethod(
    'tokenRemove', {
      description: 'Remove a token of the specified account',
      accepts: [{
        arg: 'tokenId',
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
        path: '/token-remove'
      }
    }
  );

};
