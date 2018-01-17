/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/model-generator/search-field.js
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
module.exports = function(options) {
  return {
    'name': options.models.field,
    'base': 'PersistedModel',
    'idInjection': true,
    'options': {},
    'properties': {
      'value': {
        'type': 'String',
        'required': true
      },
      'type': {
        'type': 'String',
        'required': true
      }
    },
    'relations': {
      'positions': {
        'type': 'hasMany',
        'model': options.models.position,
        'foreignKey': 'fieldId'
      }
    },
    'validations': [],
    'acls': [{
      'accessType': '*',
      'principalType': 'ROLE',
      'principalId': '$everyone',
      'permission': 'DENY'
    }],
    'methods': {}
  };
};
