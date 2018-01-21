/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/form.js
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

module.exports = function(locals) {

  var project = locals.project;

  project.extend.helper.register('form_field', function(options) {

    var form = options.form;
    var fieldProp = options.field;
    var self = this;
    var fieldName = null;
    var field = null;
    var dir = options.dir || 'form/fields';

    if (typeof fieldProp === 'string') {
      fieldName = fieldProp;
      field = _.extend({},self.get_data(
        path.join(dir ,fieldProp)));

    } else {
      field = _.extend({}, fieldProp);
    }

    var extension = field.base || field.extend;

    if (extension) {

      var preset = self.form_field({
        field: extension,
        form: form
      });
      field = _.deepMerge(
        field,
        preset
      );

    }

    if (field.ui) {
      field.name = null;
    } else {
      field.name = field.name || fieldName || field.base;
    }

    this.field_props(form, field);

    return field;

  });

  project.extend.helper.register('field_props', function(fieldParent, field) {

    if (fieldParent.lastWithName) {
      field.model = fieldParent.lastWithName.model;
      field.prop = fieldParent.lastWithName.prop;
    } else {

      if (!fieldParent.name) {
        console.error(fieldParent);
        throw new Error('Parent form must have a name');
      }

      field.model = `${fieldParent.name}Fields`;
      field.prop = fieldParent.name;
      field.lastWithName = field;

    }

    if (field.name) {
      field.model += `.${field.name}`;
      field.prop += `.${field.name}`;

      field.lastWithName = field;
    } else if (fieldParent.lastWithName) {
      field.lastWithName = fieldParent.lastWithName;
    }

    // Fix name and prop to for proper error name validation
    field.name = _.compact(field.prop.split('.'));
    var formName = field.name.shift();
    field.name = field.name.join('_');
    field.prop = `${formName}.${field.name}`;
    field.parent = fieldParent.lastWithName;

  });

  project.extend.helper.register('formValidators', function(field) {

    var validators = '';
    var validatorData = this.get_data('form/validators');

    for (var name in field.validators) {

      var value = field.validators[name];

      if (value === false) {
        continue;
      }

      switch (name) {
        case 'pattern':
          name = 'ng-pattern';
          var validator = validatorData[value];

          if(!validator){
            console.error(validatorData);
            throw new Error(`Could not find validator with name: ${name} and value: ${value}`);
          }

          value = '/' + validator.pattern + '/';
          break;
        case 'compareTo':
          name = 'compare-to';
          value = field.parent.model + '.' + value;
          break;
      }

      validators += name;
      if (value) {
        validators += '="' + value + '"';
      }
      validators += ' ';
    }

    return validators;

  });


};
