const nodemailer = require('nodemailer');

module.exports = function(app){

  var secrets = app.secrets.get('nodemailer');
  var transporter;

  return {
    init: function(){
      transporter = nodemailer.createTransport({
        host: secrets.host,
        port: secrets.port,
        secure: secrets.secure,
        auth: {
          user: secrets.user,
          pass: secrets.pass
        }
      });
    },
    send: function(options){
      return transporter.sendMail(options);
    }
  };
};
