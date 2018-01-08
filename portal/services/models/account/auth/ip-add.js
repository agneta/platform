module.exports = function(Model) {

  Model.ipAdd = function(accountId, title, address) {

    return Promise.resolve()
      .then(function() {

        return Model.getModel('Account').__get(accountId);

      })
      .then(function(account) {

        account.ip_whitelist.create({
          title: title,
          address: address
        });

      })
      .then(function(){
        return {
          success: 'You have added an IP'
        };
      });

  };

  Model.remoteMethod(
    'ipAdd', {
      description: 'Add an IP to whitelist when loging in',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      },{
        arg: 'title',
        type: 'string',
        required: true
      }, {
        arg: 'address',
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
        path: '/ip-add'
      }
    }
  );

};
