import AWS = require('aws-sdk');
import MailComposer = require('nodemailer/lib/mail-composer');

module.exports = function() {
  var ses: AWS.SES;

  return {
    init: function() {
      ses = new AWS.SES();
    },
    send: function(options: any) {
      var toAddresses = options.to.map(function(contact: any) {
        return contact.email;
      });

      var mailComposer = new MailComposer({
        from: options.from.email,
        to: toAddresses,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments
      });

      var rawMessage = mailComposer.compile();

      return ses
        .sendRawEmail({
          RawMessage: {
            Data: rawMessage
          }
        })
        .promise();
    }
  };
};
