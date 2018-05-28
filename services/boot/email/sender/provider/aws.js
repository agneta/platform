var AWS = require('aws-sdk');

module.exports = function(){

  var ses;

  return {
    init: function(){

      ses = new AWS.SES();

    },
    send: function(options){

      var toAddresses = options.to.map(function(contact){
        return contact.email;
      });

      var params = {
        Destination: {
          ToAddresses: toAddresses
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: options.html
            },
            Text: {
              Charset: 'UTF-8',
              Data: options.text
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: options.subject
          }
        },
        Source: options.from.email,
      };

      return ses.sendEmail(params)
        .promise();
    }
  };

};
