"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AWS = require("aws-sdk");
var MailComposer = require("nodemailer/lib/mail-composer");
module.exports = function () {
    var ses;
    var app;
    var bucket;
    return {
        init: function (_app) {
            ses = new AWS.SES();
            app = _app;
            bucket = app.web.services.get('storage').buckets.media;
        },
        send: function (options) {
            var toAddresses = options.to.map(function (contact) {
                return contact.email;
            });
            options.attachments = options.attachments.map(function (attachment) {
                return {
                    filename: attachment.name + "." + attachment.ext,
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
            return new Promise(function (resolve, reject) {
                mail.build(function (err, data) {
                    if (err) {
                        reject("Error sending raw email: " + err);
                    }
                    resolve(data);
                });
            }).then(function (data) {
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
//# sourceMappingURL=aws.js.map