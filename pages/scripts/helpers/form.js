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

module.exports = function(locals) {

  var project = locals.project;

  project.extend.helper.register('form_field', function(fieldProp, form) {

    var self = this;

    function getPreset(name) {
      var preset = self.get_data('form/fields/' + name);
      return _.extend({}, preset);
    }

    //

    var fieldName = null;
    var field = null;

    if (typeof fieldProp === 'string') {
      fieldName = fieldProp;
      field = getPreset(fieldProp);
    } else {
      field = _.extend({}, fieldProp);
    }

    if (field.base) {

      var preset = getPreset(field.base);
      field = _.deepMerge(
        field,
        preset
      );

    }

    if (!field.name) {
      field.name = fieldName;
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
    } else if(fieldParent.lastWithName) {
      field.lastWithName = fieldParent.lastWithName;
    }

    // Fix name and prop to for proper error name validation
    field.name = field.prop.split('.');
    var formName = field.name.shift();
    field.name = field.name.join('_');
    field.prop = `${formName}.${field.name}`;

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
          value = '/' + validatorData[value].pattern + '/';
          break;
        case 'compareTo':
          name = 'compare-to';
          value = field.parent + '.' + value;
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
