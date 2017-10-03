module.exports = function(Model) {


  Model.activateAdmin = function(id, req) {

    return Model.__signOutAll(id)
      .then(function() {
        return Model.__get(id);
      })
      .then(function(account) {
        return account.updateAttributes({
          deactivated: false
        });
      })
      .then(function() {

        Model.activity({
          req: req,
          action: 'activate_account_admin'
        });

        return {
          success: {
            title: 'Account Activated',
            content: 'The account can login again.'
          }
        };

      });

  };

  Model.remoteMethod(
    'activateAdmin', {
      description: 'Activate Account with given ID',
      accepts: [{
        arg: 'id',
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
        path: '/activate-admin'
      }
    }
  );


};
