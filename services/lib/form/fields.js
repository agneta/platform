/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/form/fields.js
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
const path = require('path');
const presetBase = 'form/presets';

module.exports = function(app, clientHelpers) {

  app.form.fields = function(options) {

    var form = options.form;
    var onField = options.onField;
    var formFields = {};
    var formName;

    if (_.isString(form)) {
      formName = form;
      let dataPath = formName;
      if(dataPath.indexOf(presetBase)!=0){
        dataPath = path.join(presetBase,dataPath);
      }
      form = clientHelpers.get_data(dataPath);

      if(!form){
        throw new Error(`Could not find form with name: ${formName}`);
      }

    }

    if(!form.name){
      form.name = options.name || formName;
    }

    scan(form);

    function scan(data) {

      if (_.isString(data)) {
        data = clientHelpers.get_data(data);
      }

      for (var field of data.fields) {

        field = clientHelpers.form_field({
          field: field,
          form: data
        });

        if(field.name && !field.static){
          formFields[field.name] = field;

          if (onField) {
            onField(field);
          }
        }

        if (field.fields) {
          scan(field);
        }

      }

    }

    return formFields;


  };

};
