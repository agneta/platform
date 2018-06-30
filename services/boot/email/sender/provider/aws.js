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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQWdDO0FBQ2hDLDJEQUE4RDtBQUc5RCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2YsSUFBSSxHQUFZLENBQUM7SUFDakIsSUFBSSxHQUFRLENBQUM7SUFDYixJQUFJLE1BQVcsQ0FBQztJQUNoQixPQUFPO1FBQ0wsSUFBSSxFQUFFLFVBQVMsSUFBUztZQUN0QixHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDcEIsR0FBRyxHQUFHLElBQUksQ0FBQztZQUVYLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUN6RCxDQUFDO1FBQ0QsSUFBSSxFQUFFLFVBQVMsT0FBWTtZQUN6QixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFTLE9BQVk7Z0JBQ3BELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQztZQUN2QixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBUyxVQUFlO2dCQUNwRSxPQUFPO29CQUNMLFFBQVEsRUFBSyxVQUFVLENBQUMsSUFBSSxTQUFJLFVBQVUsQ0FBQyxHQUFLO29CQUNoRCxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7d0JBQ25DLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTzt3QkFDdEIsR0FBRyxFQUFFLFVBQVUsQ0FBQyxRQUFRO3FCQUN6QixDQUFDO2lCQUNILENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksV0FBVyxHQUFHO2dCQUNoQixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLO2dCQUN4QixFQUFFLEVBQUUsV0FBVztnQkFDZixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87Z0JBQ3hCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtnQkFDbEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO2dCQUNsQixXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7YUFDakMsQ0FBQztZQUNGLDJCQUEyQjtZQUUzQixJQUFJLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVqRCxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFbEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRSxNQUFNO2dCQUN6QyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVMsR0FBRyxFQUFFLElBQUk7b0JBQzNCLElBQUksR0FBRyxFQUFFO3dCQUNQLE1BQU0sQ0FBQyw4QkFBNEIsR0FBSyxDQUFDLENBQUM7cUJBQzNDO29CQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEIsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxJQUFJO2dCQUNuQixPQUFPLEdBQUc7cUJBQ1AsWUFBWSxDQUFDO29CQUNaLFVBQVUsRUFBRTt3QkFDVixJQUFJLEVBQUUsSUFBSTtxQkFDWDtpQkFDRixDQUFDO3FCQUNELE9BQU8sRUFBRSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUMsQ0FBQyJ9