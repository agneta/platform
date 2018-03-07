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

module.exports = MailConnector;

function MailConnector(options) {
  var app = options.app;

  this.config = app.get('email');
  this.secrets = app.secrets.get('email');

  if (!this.config) {
    throw new Error('No Email config is present');
  }

  //--------------------------------------------------------------

  this.subjectPrefix = _.get(this.config,'subject.prefix');
  //--------------------------------------------------------------

  switch(this.secrets.provider){
    case 'sendgrid':
      this.provider = require('./sendgrid');
      break;
    case 'nodemailer':
      this.provider = require('./nodemailer');
      break;
    default:
      throw new Error(`Uknown email provider: ${this.secrets.provider}`);
  }
}

MailConnector.name = 'email';

function Mailer() {
}

MailConnector.prototype.DataAccessObject = Mailer;

MailConnector.initialize = function(cb){
  var self = this;
  return Promise.resolve()
    .then(function(){
      return self.provider.init();
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
        to: options.to,
        from: options.from || _.get(connector.config,'contacts.default.email')
      };

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

      //console.log('email options',emailOptions);

      return connector.provider.send(emailOptions);

    })
    .asCallback(cb);

};

Mailer.prototype.send = function(fn) {
  this.constructor.send(this, fn);
};
