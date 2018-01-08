module.exports = function(Model) {


  Model.tokenList = function(accountId) {

    return Model.getModel('AccessToken')
      .find({
        where: {
          userId: accountId
        },
        order: 'created DESC'
      })
      .then(function(tokens) {

        return {
          list: tokens
        };

      });
  };

  Model.remoteMethod(
    'tokenList', {
      description: 'List all tokens of the specified account',
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
        verb: 'get',
        path: '/token-list'
      }
    }
  );

};
