const _ = require('lodash');

module.exports = function(options){

  var app = options.app;
  var fields = options.fields;
  var form = options.form;
  var req = options.req;

  var emailConfig = form.email || {};
  _.defaults(emailConfig,{
    templateSender: 'form',
    templateReceiver: 'form-reply'
  });
  console.log(form);
  var emails = app.get('email').contacts;
  var userEmail;

  return function(){
    return Promise.resolve()
      .then(function(){
        userEmail = _.get(fields,'email.value');
        if(!userEmail){
          return app.models.Account.findById(req.accessToken.userId,{
            fields: {
              email: true
            }
          })
            .then(function(account) {
              userEmail = account.email;
            });
        }
      })
      .then(function(){

        if(!userEmail){
          throw new Error(`Could not find user email address for form: ${form.name}`);
        }

        var subject = emailConfig.subject || emailConfig.title;
        subject = app.lng(subject, req);

        var header = emailConfig.header || emailConfig.title;
        header = app.lng(header, req);

        var sendOptions = {
          subject: subject,
          name: emailConfig.name,
          req: req,
          data: {
            header: header,
            fields: fields
          }
        };

        if (emailConfig.forward) {

          for (var entry of emailConfig.forward) {

            var send = true;
            var entryIf = entry.if;

            if (entryIf) {

              send = false;

              if (!entryIf.field) {
                continue;
              }

              var field = fields[entryIf.field];

              if (entryIf.is) {
                if (field.sourceValue == entryIf.is) {
                  send = true;
                }
              }
            }

            var to = emails[entry.contact];

            if (send && to) {
              app.loopback.Email.send(_.extend({
                to: to,
                templateName: 'form'
              }, sendOptions));
            }

          }

        } else {

          app.loopback.Email.send(_.extend({
            to: emails.support,
            templateName: emailConfig.templateSender
          }, sendOptions));

        }

        app.loopback.Email.send(_.extend({
          to: userEmail,
          templateName: emailConfig.templateReceiver
        }, sendOptions));

        //----------------------------------------------------------------

      });
  };
};
