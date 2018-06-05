
module.exports = function(Model,app) {

  Model.inboxAccounts = function() {

    var domain = app.web || app.client;
    domain = domain.project.config.domain.production;

    return app.models.Contact_Address.getCollection()
      .find({
        $text:{
          $search: `"${domain}"`
        }
      })
      .sort({
        email: 1
      })
      .toArray()
      .then(function(accounts) {
        return {
          list: accounts
        };
      });
  };

  Model.remoteMethod(
    'inboxAccounts', {
      description: 'Return inbox accounts',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/inbox-accounts'
      }
    }
  );

};
