const INTERVAL = 1000*60;
const Promise = require('bluebird');
const urljoin = require('url-join');
const path = require('path');
const simpleParser = require('mailparser').simpleParser;
const _ = require('lodash');
const stream = require('stream');

module.exports = function(app) {

  var config = app.get('storage');

  if (!config) {
    return;
  }

  return Promise.resolve()
    .then(function() {
      function rotateCheck() {

        return Promise.resolve()
          .then(function() {
            return app.storage.listObjects({
              Bucket: config.buckets.email,
              Prefix: 'incoming/'
            });
          })
          .then(function(result) {

            //console.log(result);

            return Promise.map(result.Contents,function(item) {

              var KeyParsed = path.parse(item.Key);
              //var KeyNew = urljoin('processed',KeyParsed.name);
              var email;
              var emailParsed;
              var emailProps;

              return Promise.resolve()
              /*  return app.storage.moveObject({
                Bucket: config.buckets.email,
                From: item.Key,
                To: KeyNew
              });
            })*/
                .then(function() {
                  return app.storage.getObjectStream({
                    Bucket: config.buckets.email,
                    Key: item.Key
                    //Key: KeyNew
                  });
                })
                .then(function(stream) {
                  return simpleParser(stream);
                })
                .then(function(_emailParsed) {
                  emailParsed = _emailParsed;

                  emailProps = {
                    storageKey: KeyParsed.name,
                    spam: emailParsed.headers['x-ses-spam-verdict']=='PASS',
                    infected: emailParsed.headers['x-ses-virus-verdict']=='PASS',
                    subject: emailParsed.subject,
                    date: emailParsed.date,
                    type: 'received',
                    attachments: _.map(emailParsed.attachments,function(attachment){
                      return _.pick(attachment,['filename','contentType','size']);
                    })
                  };

                  return app.models.Contact_Email.findOrCreate({
                    storageKey: KeyParsed.name
                  },emailProps);
                })
                .then(function(result){
                  if(result[1]){
                    //created
                    return result[0];
                  }
                  return result[0].updateAttributes(emailProps);
                })
                .then(function(_email){
                  email = _email;

                  if(email.infected){
                    return;
                  }

                  return Promise.map(emailParsed.attachments,function(attachment){

                    var bufferStream = new stream.PassThrough();
                    bufferStream.end(attachment.content);

                    return app.models.Media_Private.__sendFile({
                      location: urljoin('email','attachments',KeyParsed.name,attachment.filename),
                      mimetype: attachment.contentType,
                      stream: bufferStream
                    });
                  });

                })
                .then(function() {

                  return Promise.all([
                    checkContacts('to'),
                    checkContacts('from'),
                    checkContacts('cc')
                  ]);

                  function checkContacts(type) {
                    var contacts = emailParsed[type];
                    return Promise.resolve()
                      .then(function() {

                        if(!contacts){
                          return;
                        }
                        contacts = contacts.value;
                        return Promise.map(contacts,function(contact){
                          console.log(contact);
                          let contactName;
                          if(contact.name.length){
                            contactName = contact.name;
                          }
                          return app.models.Contact_Address.findOrCreate({
                            email: contact.address,
                          },{
                            email: contact.address,
                            name: contactName
                          })
                            .then(function(address){
                              return app.models.Contact_Email_Address.create({
                                addressId: address.id,
                                emailId: email.id,
                                type: type
                              });
                            });
                        });
                      });
                  }

                });

            },{
              concurrency: 5
            });
            /*
                return settings.app.models.Contact_Email.create({
                  accountFromId:
                  accountToId:
                  emailTo:
                  emailFrom:
                  type: 'sent',
                  subject: subject,
                  html: emailOptions.html
                });*/

          })
          .then(function() {

            return Promise.delay(INTERVAL).then(rotateCheck);
          });
      }

      rotateCheck();

    });

};
