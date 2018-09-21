import Promise = require('bluebird');
import MailComposer = require('nodemailer/lib/mail-composer');
import { AnalysisScheme } from 'aws-sdk/clients/cloudsearch';

module.exports = function() {
  var app: any;
  var bucket: any;
  var ses: any;
  return {
    init: function(_app: any) {
      app = _app;
      ses = app.web.services.aws.ses;

      bucket = app.web.services.get('storage').buckets.media;
    },
    send: function(options: any) {
      var toAddresses = options.to.map(function(contact: any) {
        return contact.email;
      });

      options.attachments = options.attachments.map(function(attachment: any) {
        return {
          filename: `${attachment.name}.${attachment.ext}`,
          content: app.storage.getObjectStream({
            Bucket: bucket.private,
            Key: attachment.location
          })
        };
      });

      var mailOptions = {
        from: options.from.email,
        to: toAddresses,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments
      };
      //console.log(mailOptions);

      var mailComposer = new MailComposer(mailOptions);

      var mail = mailComposer.compile();

      return new Promise(function(resolve, reject) {
        mail.build(function(err, data) {
          if (err) {
            reject(`Error sending raw email: ${err}`);
          }
          resolve(data);
        });
      }).then(function(data) {
        return ses
          .sendRawEmail({
            RawMessage: {
              Data: data
            }
          })
          .promise();
      });
    }
  };
};
