module.exports = function(Model) {


  Model.deactivateAdmin = function(id, req) {

    return Model.__signOutAll(id)
      .then(function() {
        return Model.__get(id);
      })
      .then(function(account) {
        return account.updateAttributes({
          deactivated: true
        });
      })
      .then(function() {

        Model.activity({
          req: req,
          action: 'deactivate_account_admin'
        });

        return {
          success: {
            title: 'Deactivation Complete',
            content: 'The account may be recovered by trying to login again.'
          }
        };

      });

  };

  Model.remoteMethod(
    'deactivateAdmin', {
      description: 'Deactivate Account with given ID',
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
        path: '/deactivate-admin'
      }
    }
  );


};
