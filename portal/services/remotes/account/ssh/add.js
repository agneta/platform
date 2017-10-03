module.exports = function(Model) {


  Model.sshAdd = function(accountId, title, content) {

    return Model.__get(accountId)
      .then(function(account) {

        return account.sshKeys.add({
          title: title,
          content: content
        });

      })
      .then(function(key) {
        return {
          success: 'SSH Key added to account',
          key: key
        };
      });

  };

  Model.remoteMethod(
    'sshAdd', {
      description: 'Activate Account with given ID',
      accepts: [{
        arg: 'title',
        type: 'string',
        required: true
      }, {
        arg: 'content',
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
        path: '/ssh-add'
      }
    }
  );

};
