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

function MailConnector(options) {
  var app = options.app;
  var self = this;

  self.config = app.web.services.get('email');
  self.secrets = app.web.services.secrets.get('email');

  if (!self.config) {
    throw new Error('No Email config is present');
  }

  //--------------------------------------------------------------

  self.subjectPrefix = _.get(self.config,'subject.prefix');
  //--------------------------------------------------------------

  var provider;

  switch(self.secrets.provider){
    case 'sendgrid':
      provider = require('./sendgrid');
      break;
    case 'nodemailer':
      provider = require('./nodemailer');
      break;
    default:
      throw new Error(`Uknown email provider: ${self.secrets.provider}`);
  }

  self.provider = provider({
    secrets: self.secrets
  });
}

MailConnector.name = 'email';

function Mailer() {
}

MailConnector.prototype.DataAccessObject = Mailer;

MailConnector.initialize = function(dataSource,cb){

  dataSource.connector = new MailConnector(dataSource.settings);

  return Promise.resolve()
    .then(function(){
      return dataSource.connector.provider.init();
    })
    .asCallback(cb);
};

Mailer.send = function(options,cb) {

  var dataSource = this.dataSource;
  var settings = dataSource && dataSource.settings;
  var connector = dataSource.connector;

  assert(connector, 'Cannot send mail without a connector!');

  return Promise.resolve()
    .then(function() {

      if (!options.req) {
        throw new Error('Must have a request object to send email');
      }

      if (!options.to) {
        throw new Error('Must provide an email to send to');
      }

      //--------------------------------------------------

      var language = settings.app.getLng(options.req);
      var emailData = _.extend({},options.data, {
        info: connector.config.info,
        language: language
      });
      var emailOptions = {
        to: checkContact(options.to),
        from: checkContact(
          options.from || _.get(connector.config,'contacts.default.email')
        )
      };

      function checkContact(contact){
        if(_.isString(contact)){
          return contact;
        }
        if(contact.name && _.isObject(contact.name)){
          contact.name = settings.app.lng(contact.name,options.req);
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
      emailOptions.text = renderResult.text || connector.config.text(emailOptions.html);

      //--------------------------------------------------

      var subject = options.subject || template.data.subject;

      if (_.isObject(subject)) {
        subject = settings.app.lng(subject, language);
      }

      if(connector.subjectPrefix){
        subject = settings.app.lng(connector.subjectPrefix,language) + subject;
      }

      emailOptions.subject = subject;

      //--------------------------------------------------

      console.log('email options',emailOptions);

      return connector.provider.send(emailOptions);

    })
    .asCallback(cb);

};

Mailer.prototype.send = function(fn) {
  this.constructor.send(this, fn);
};

module.exports = MailConnector;
