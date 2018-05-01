const _ = require('lodash');

module.exports = function(Model, app) {

  var config = app.web.services.get('email');
  var clientHelpers = app.web.app.locals;

  Model.send = function(to, subject, message, req) {

    var accountFrom;
    var accountFromId = req.accessToken.userId;

    return Model.findById(accountFromId, {
      include: ['team_member'],
      fields: {
        id: true,
        picture: true,
        name: true
      }
    })
      .then(function(_accountFrom) {

        accountFrom = _accountFrom;

        return Model.findOne({
          where:{
            email: to
          },
          fields: {
            id: true,
            name: true
          }
        });
      })
      .then(function(accountTo) {

        var from = _.extend(
          config.contacts.support || config.contacts.default,
          {
            id: accountFromId
          }
        );

        var picture;

        if(accountFrom.picture.media){
          picture = clientHelpers.prv_media(accountFrom.picture.media);
        }

        return app.loopback.Email.send({
          from: from,
          to: accountTo,
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
        });

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
