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
var DataSource = require('loopback-datasource-juggler').DataSource;
var utils = require('loopback/lib/utils');
var _ = require('lodash');

module.exports = function(app) {


  var config = app.get('email');

  if (!config) {
    throw new Error('No Email config is present');
  }

  //--------------------------------------------------------------

  var subjectPrefix = _.get(config,'subject.prefix');

  //--------------------------------------------------------------

  var dataSource;

  if (config.sendgrid) {
    dataSource = new DataSource('loopback-connector-sendgrid', {
      api_key: config.sendgrid.apiKey
    });
  }

  if (!dataSource) {
    throw new Error('Must have an email datasource');
  }

  app.loopback.Email.attachTo(dataSource);

  var emailSend = app.loopback.Email.send;

  app.loopback.Email.send = function(options, cb) {

    cb = cb || utils.createPromiseCallback();

    options.from = options.from || config.contacts.default;

    //-------
    if (!options.req) {
      return cb(new Error('Must have a request object to send email'));
    }
    options.language = app.getLng(options.req);

    //-------

    options.sender = options.from;
    if (_.isString(options.from)) {
      options.sender = {
        email: options.from
      };
    }
    options.from = options.sender.email;

    //-------

    options.receiver = options.to;
    if (_.isString(options.to)) {
      options.receiver = {
        email: options.to
      };
    }
    options.to = options.receiver.email;

    //-------

    _.extend(options.data, {
      info: config.info,
      language: options.language
    });

    ///////////////////////////////////////////////////////////////
    //
    ///////////////////////////////////////////////////////////////

    var template = config.templates[options.templateName];

    if (template) {
      var renderResult = template.render(options.data);

      options.html = renderResult.html;
      options.text = renderResult.text;

    }
    send();

    ///////////////////////////////////////////////////////////////

    function send() {

      options.text = options.text || config.text(options.html);

      //----------------------------------

      var subject = options.subject || template.data.subject;

      if (_.isObject(subject)) {
        subject = app.lng(subject, options.language);
      }

      if(subjectPrefix){
        options.subject = app.lng(subjectPrefix,options.language) + subject;
      }

      //----------------------------------

      emailSend.call(app.loopback.Email, options)
        .catch(function(err) {
          console.error(err);
        });
    }


    return cb.promise;
  };

};
