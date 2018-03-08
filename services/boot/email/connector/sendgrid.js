const sgMail = require('@sendgrid/mail');

module.exports = function(options){

  var secrets = options.secrets;

  return {
    init: function(){
      sgMail.setApiKey(secrets.key);
    },
    send: function(options){
      return sgMail.send(options);
    }
  };
};
