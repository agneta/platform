/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/form/generate.js
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
var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function(Model, app) {

  var emails = app.get('email').contacts;

  _.keys(Model.formServices.methods).forEach(function(name) {

    var formMethod = Model.formServices.methods[name];

    formMethod.name = name;

    if(_.isString(formMethod.data)){
      var formName = formMethod.data;
      formMethod.data = Model.clientHelpers.get_data(formMethod.data);
      formMethod.data.name = formMethod.data.name || formName;
    }
    var result = Model.newMethod(formMethod);
    formMethod.remote = result;

    if (formMethod.hidden) {
      return;
    }

    Model[formMethod.name] = function() {
      return result.method(arguments)
        .then(function(result) {

          var fields = result.fields;
          var form = result.form;
          var req = result.req;

          var title = app.lng(form.title, req);
          var sendOptions = {
            subject: title,
            name: formMethod.name,
            req: req,
            data: {
              header: title,
              fields: fields
            }
          };

          if (formMethod.forward) {

            for (var entry of formMethod.forward) {

              var send = true;
              var entryIf = entry.if;

              if (entryIf) {

                send = false;

                if (!entryIf.field) {
                  continue;
                }

                var field = fields[entryIf.field];

                if (entryIf.is) {
                  if (field.sourceValue == entryIf.is) {
                    send = true;
                  }
                }
              }

              var to = emails[entry.contact];

              if (send && to) {
                app.loopback.Email.send(_.extend({
                  to: to,
                  templateName: 'form'
                }, sendOptions));
              }

            }

          } else {

            app.loopback.Email.send(_.extend({
              to: emails.support,
              templateName: 'form'
            }, sendOptions));

          }

          if (fields.email) {
            app.loopback.Email.send(_.extend({
              to: fields.email.value,
              templateName: 'form-reply'
            }, sendOptions));
          }

          //----------------------------------------------------------------

          Model.new({
            title: form.title,
            name: formMethod.name,
            req: req,
            data: sendOptions.data
          })
            .then(function(form) {

              return app.models.Activity_Item.new({
                feed: 'form',
                req: req,
                action: {
                  value: formMethod.name,
                  type: 'form'
                },
                data: {
                  formId: form.id
                }
              });
            })
            .catch(console.error);

          //----------------------------------------------------------------

          return Promise.resolve({
            success: app.lng(Model.formServices.success, req)
          });

        });

    };

    Model.remoteMethod(
      formMethod.name, {
        description: 'Send Contact form to "' + formMethod.name + '"',
        accepts: result.accepts,
        returns: {
          arg: 'result',
          type: 'object',
          root: true
        },
        http: {
          verb: 'post',
          path: '/' + formMethod.name
        },
      }
    );

    Model.beforeRemote(formMethod.name, app.form.check(result.fields));

  });


};
