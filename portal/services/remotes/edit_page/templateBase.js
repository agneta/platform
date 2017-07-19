/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/edit_page/templateBase.js
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

module.exports = function(template) {

    var fields = [{
            name: 'title',
            validators: {
                required: true
            },
            title: {
                en: 'Title',
                gr: 'Τίτλος'
            },
            type: 'text-single'
        },
        {
            name: 'description',
            validators: {
                required: true
            },
            title: {
                en: 'Description',
                gr: 'Περιγραφή'
            },
            type: 'text'
        }
    ];

    template.fields = [].concat(fields, template.fields);
};
