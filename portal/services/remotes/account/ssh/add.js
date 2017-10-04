module.exports = function(Model,app) {


  Model.sshAdd = function(accountId, title, content) {

    return Model.__get(accountId)
      .then(function(account) {

        return account.ssh.create({
          title: title,
          content: content,
          createdAt: new Date()
        });

      })
      .then(function(key) {
        return {
          success: 'SSH Key added to account',
          key: key
        };
      });

  };

  var fields = app.models.Form.scanFields({
    form: 'ssh-add-key'
  });

  Model.beforeRemote('sshAdd',  app.models.Form.checkProperties(fields));

  Model.remoteMethod(
    'sshAdd', {
      description: 'Activate Account with given ID',
      accepts: [{
        arg: 'accountId',
        type: 'string',
        required: true
      },{
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
