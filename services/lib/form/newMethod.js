/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/form/newMethod.js
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

module.exports = function(app) {

  app.form.newMethod = function(formMethod) {

    var form = formMethod.data;

    if(!form){
      throw new Error(`Cannot create form method with name: ${formMethod.name}`);
    }

    var accepts = [{
      arg: 'req',
      type: 'object',
      'http': {
        source: 'req'
      }
    }];

    var formFields = app.form.fields({
      form: form,
      onField: function(field) {
        var type = field.valueType || 'string';

        switch (field.type) {
          case 'number':
            type = 'number';
            break;
        }

        accepts.push({
          arg: field.name,
          type: type,
          required: field.validators && field.validators.required
        });
      }
    });

    function method(args) {

      var req = args[0];
      var fields = {};

      _.map(args, function(value, index) {
        var map = accepts[index];

        if (!map) {
          return;
        }
        var field = formFields[map.arg];

        if (!field || field.sendDisabled) {
          return;
        }

        var title = field.title || field.name;
        var sourceValue = value;

        if (field.options) {

          var option = _.find(field.options, {
            value: value
          });

          if (option && option.title) {
            value = app.lng(option.title, req);
          }

        }

        field = {
          name: map.arg,
          title: title,
          value: value,
          sourceValue: sourceValue
        };

        fields[map.arg] = field;

      });

      var values = _.mapValues(fields, 'value');

      return Promise.resolve({
        fields: fields,
        values: values,
        req: req,
        form: form
      });


    }
    return {
      fields: formFields,
      fieldNames: _.keys(formFields),
      method: method,
      accepts: accepts
    };

  };
};
