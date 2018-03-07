const sgMail = require('@sendgrid/mail');

module.exports = function(app){

  var secrets = app.secrets.get('sendgrid');

  return {
    init: function(){
      sgMail.setApiKey(secrets.key);
    },
    send: function(options){
      return sgMail.send(options);
    }
  };
};
