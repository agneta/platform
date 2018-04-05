module.exports = function(Model) {


  Model.tokenRemove = function(id) {

    return Model.getModel('AccountToken')
      .findById(id)
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
        arg: 'id',
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
