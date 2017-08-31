const Promise = require('bluebird');

module.exports = function(Model) {


  Model.search = function(query) {

    var findWhere = {
      $text: {
        $search: query
      }
    };

    var findFields = {
      score: {
        $meta: 'textScore'
      },
      password: false,
      verificationToken: false
    };

    return Model.dataSource.connector.collection(Model.definition.name)
      .find(findWhere, findFields)
      .sort({
        score: {
          $meta: 'textScore'
        }
      })
      .limit(10)
      .toArray()
      .then(function(accounts) {

        return Promise.map(accounts, function(account) {

          account.id = account._id;
          delete account._id;

          return account;

        });
      })
      .then(function(accounts) {
        return {
          accounts: accounts
        };
      });

  };

  Model.remoteMethod(
    'search', {
      description: 'Find a user',
      accepts: [{
        arg: 'query',
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
        path: '/search'
      }
    }
  );

};
