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

module.exports = function(app) {


  var config = app.get('email');

  if (!config) {
    throw new Error('No Email config is present');
  }

  //--------------------------------------------------------------

  var subjectPrefix = _.get(config,'subject.prefix');
  var provider;
  //--------------------------------------------------------------

  switch(config.provider){
    case 'sendgrid':
      provider = require('./sendgrid');
      break;
    case 'nodemailer':
      provider = require('./nodemailer');
      break;
    default:
      throw new Error(`Uknown email provider: ${config.provider}`);
  }

  app.loopback.Email.send = function(options,cb) {

    return Promise.resolve()
      .then(function() {

        if (!options.req) {
          throw new Error('Must have a request object to send email');
        }

        if (!options.to) {
          throw new Error('Must provide an email to send to');
        }

        //--------------------------------------------------

        var language = app.getLng(options.req);
        var emailData = _.extend({},options.data, {
          info: config.info,
          language: language
        });
        var emailOptions = {
          to: options.to,
          from: options.from || _.get(config,'contacts.default.email')
        };

        //--------------------------------------------------

        var template = config.templates[options.templateName];

        if (!template) {
          throw new Error(`Email template not found: ${options.templateName}`);
        }

        var renderResult = template.render(emailData);
        emailOptions.html = renderResult.html;
        emailOptions.text = renderResult.text || config.text(emailOptions.html);

        //--------------------------------------------------

        var subject = options.subject || template.data.subject;

        if (_.isObject(subject)) {
          subject = app.lng(subject, language);
        }

        if(subjectPrefix){
          subject = app.lng(subjectPrefix,language) + subject;
        }

        emailOptions.subject = subject;

        //--------------------------------------------------

        //console.log('email options',emailOptions);

        return provider.send(emailOptions);

      })
      .asCallback(cb);


  };

  return Promise.resolve()
    .then(function(){
      return provider.init();
    });

};
