/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/sendgrid.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
const _ = require('lodash');
const Promise = require('bluebird');
const assert = require('assert');
const validator = require('validator');
var prettyBytes = require('pretty-bytes');
const attachmentMaxSize = 25 * 1000 * 1000;

function Mailer() {}

Mailer.send = function(options, cb) {
  var dataSource = this.dataSource;
  var settings = dataSource && dataSource.settings;
  var connector = dataSource.connector;
  var app = settings.app;

  assert(connector, 'Cannot send mail without a connector!');

  return Promise.resolve()
    .then(function() {
      if (!options.req) {
        throw new Error('Must have a request object to send email');
      }

      if (!options.to) {
        throw new Error('Must provide an email to send to');
      }

      if (!_.isArray(options.to)) {
        options.to = [options.to];
      }

      options.to = options.to.map(function(contact) {
        return checkContact(contact);
      });

      options.from =
        options.from || _.get(connector.config, 'contacts.default.email');
      options.from = checkContact(options.from);

      //--------------------------------------------------

      var language = app.getLng(options.req);
      var emailData = _.extend({}, options.data, {
        info: connector.config.info,
        language: language
      });
      var emailOptions = {
        to: options.to,
        from: options.from
      };

      function checkContact(contact) {
        if (_.isString(contact)) {
          contact = {
            email: contact
          };
        }
        if (!_.isObject(contact)) {
          throw new Error(`Invalid type for contact: ${contact}`);
        }
        if (contact.name && _.isObject(contact.name)) {
          contact.name = app.lng(contact.name, options.req);
        }
        if (contact.address) {
          contact.email = contact.address;
          delete contact.address;
        }
        if (!_.isString(contact.email) || !validator.isEmail(contact.email)) {
          throw new Error(`Email contact is not valid: ${contact.email}`);
        }
        return contact;
      }

      //--------------------------------------------------

      var template = connector.config.templates[options.templateName];

      if (!template) {
        throw new Error(`Email template not found: ${options.templateName}`);
      }

      var renderResult = template.render(emailData);
      emailOptions.html = renderResult.html;
      emailOptions.text =
        renderResult.text || connector.config.text(emailOptions.html);

      //--------------------------------------------------

      var subject = options.subject || template.data.subject;

      if (_.isObject(subject)) {
        subject = app.lng(subject, language);
      }

      if (connector.subjectPrefix) {
        subject = app.lng(connector.subjectPrefix, language) + subject;
      }

      emailOptions.subject = subject;
      var contactEmail;

      return (
        Promise.resolve()

          //--------------------------------------------------

          .then(function() {
            options.attachments = options.attachments || [];
            var totalSize = 0;
            return Promise.map(options.attachments, function(attachment) {
              if (!_.isString(attachment)) {
                throw new Error('Attachment needs to be a string');
              }
              return app.models.Media_Private.__details({
                location: attachment
              }).then(function(item) {
                if (item.notfound) {
                  throw new Error(`Attachment not found: ${item.location}`);
                }
                totalSize += item.sizeBytes;
                if (totalSize > attachmentMaxSize) {
                  throw new Error(`Attachments have exceeded ${prettyBytes}`);
                }

                return item;
              });
            }).then(function(attachments) {
              emailOptions.attachments = attachments;
            });
          })

          //--------------------------------------------------

          //console.log('email options',emailOptions);

          .then(function() {
            if (emailOptions.to.id) {
              return emailOptions.to;
            }
            return app.models.Account.findOne({
              where: {
                email: emailOptions.to.email
              },
              fields: {
                id: true
              }
            });
          })
          .then(function(accountTo) {
            accountTo = accountTo || {};
            return app.models.Contact_Email.create({
              accountFromId:
                emailOptions.from.id ||
                _.get(options.req, 'accessToken.userId'),
              accountToId: accountTo.id,
              emailTo: emailOptions.to,
              emailFrom: emailOptions.from,
              type: 'sent',
              subject: subject,
              html: emailOptions.html
            });
          })
          .then(function(_contactEmail) {
            contactEmail = _contactEmail;
            return connector.provider.send(emailOptions);
          })
          .then(function() {
            return contactEmail.updateAttributes({
              status: 'success'
            });
          })
          .catch(function(err) {
            return contactEmail
              .updateAttributes({
                status: 'error',
                error: err
              })
              .then(function() {
                return Promise.reject(err);
              });
          })
      );
    })
    .catch(function(err) {
      err.statusCode = 400;
      return Promise.reject(err);
    })
    .asCallback(cb);
};

Mailer.prototype.send = function(fn) {
  this.constructor.send(this, fn);
};

module.exports = Mailer;
