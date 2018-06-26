"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AWS = require("aws-sdk");
var MailComposer = require("nodemailer/lib/mail-composer");
module.exports = function () {
    var ses;
    return {
        init: function () {
            ses = new AWS.SES();
        },
        send: function (options) {
            var toAddresses = options.to.map(function (contact) {
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
//# sourceMappingURL=aws.js.map