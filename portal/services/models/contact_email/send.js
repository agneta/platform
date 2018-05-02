const _ = require('lodash');

module.exports = function(Model, app) {

  var config = app.web.services.get('email');
  var clientHelpers = app.web.app.locals;

  Model.send = function(to, subject, message, req) {

    var accountFrom;
    var accountFromId = req.accessToken.userId;
    var Account = Model.projectModel('Account');

    return Account.findById(accountFromId, {
      include: ['team_member'],
      fields: {
        id: true,
        picture: true,
        name: true
      }
    })
      .then(function(_accountFrom) {

        accountFrom = _accountFrom.__data;
        return Account.findOne({
          where:{
            email: to
          },
          fields: {
            id: true,
            name: true,
            email: true
          }
        });
      })
      .then(function(accountTo) {

        if(accountTo){
          to = accountTo;
        }

        var from = _.extend(
          config.contacts.support || config.contacts.default,
          {
            id: accountFromId
          }
        );

        var picture;

        if(accountFrom.picture.media){
          picture = clientHelpers.prv_media(accountFrom.picture.media,'small');
        }

        var emailOptions = {
          from: from,
          to: to,
          req: req,
          subject: subject,
          templateName: 'message',
          data:{
            message: message,
            account:{
              name: accountFrom.name,
              picture: picture,
              position: accountFrom.team_member.position
            }
          }
        };
        return app.loopback.Email.send(emailOptions);

      })
      .then(function(){
        return {
          success: 'Email sent!'
        };
      });

  };

  Model.remoteMethod(
    'send', {
      description: 'Send an email to a contact',
      accepts: [{
        arg: 'to',
        type: 'string',
        required: true
      }, {
        arg: 'subject',
        type: 'string',
        required: false
      }, {
        arg: 'message',
        type: 'string',
        required: true
      }, {
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }
      ],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/send'
      }
    }
  );

};
