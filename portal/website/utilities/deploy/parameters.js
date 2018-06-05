/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/deploy/parameters.js
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
module.exports = [{
  name: 'target',
  title: {
    en: 'Destination:',
    gr: 'Προορισμός:'
  },
  type: 'radio',
  values: [{
    name: 'staging',
    title: 'Staging'
  }, {
    name: 'production',
    title: 'Production',
  },{
    name: 'portal',
    title: 'Portal',
    if: 'source.services'
  }]
}, {
  name: 'source',
  title: {
    en: 'What to deploy?',
    gr: 'Τι να μεταφέρετε;'
  },
  type: 'checkboxes',
  values: [{
    name: 'pages',
    title: {
      en: 'Pages',
      gr: 'Σελίδες'
    }
  }, {
    name: 'services',
    title: {
      en: 'Services',
      gr: 'Υπηρεσίες'
    }
  }]
},{
  name: 'promote',
  title: {
    en: 'Promote',
    gr: 'Προώθηση'
  },
  if: {
    prop: 'target',
    equals: 'production'
  },
  type: 'checkboxes',
  values: [{
    name: 'media',
    title: {
      en: 'Media',
      gr: 'Πολυμέσα'
    }
  }]
}
];
