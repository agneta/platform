/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/model-generator/search-position.js
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
    'name': options.models.position,
    'base': 'PersistedModel',
    'idInjection': true,
    'options': {},
    'properties': {
      'value': {
        'type': 'Number',
        'required': true
      },
      'original': {
        'type': 'String',
        'required': true
      },
      'fieldId': {
        'type': 'String',
        'required': true
      },
      'keywordId': {
        'type': 'String',
        'required': true
      },
      'pageId': {
        'type': 'String',
        'required': true
      }
    },
    'relations': {
      'page': {
        'type': 'belongsTo',
        'model': options.models.source,
        'foreignKey': 'pageId'
      },
      'keyword': {
        'type': 'belongsTo',
        'model': options.models.keyword,
        'foreignKey': 'keywordId'
      },
      'field': {
        'type': 'belongsTo',
        'model': options.models.field,
        'foreignKey': 'fieldId'
      }
    },
    'indexes': {
      'page_keyword_index': {
        'pageId': 1,
        'keywordId': 1
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
