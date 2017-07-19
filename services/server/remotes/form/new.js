/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/form/new.js
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

module.exports = function(Model, app) {

    Model.prepareFields = function(options) {

        var data = options.data;
        var form;

        for (var key in data.fields) {
            var field = data.fields[key];

            if (_.isObject(field)) {
                field = _.pick(field, ['title', 'value']);
                if (_.isObject(field.title)) {
                    field.title = app.lng(field.title, options.language || options.req);
                }
                data.fields[key] = field;
                continue;
            }

            if (!form) {
                form = app.models.Form.formServices.methods[options.form];
            }

            var fieldConfig = form.remote.fields[key];
            if (fieldConfig) {
                data.fields[key] = {
                    title: app.lng(fieldConfig.title, options.language || options.req),
                    value: field
                };
            }

        }

    };

    Model.new = function(options) {

        options.language = app.getLng(options.req);
        options.accountId = options.req.accessToken && options.req.accessToken.userId;

        if (_.isObject(options.title)) {
            options.title = app.lng(options.title, options.language);
        }

        var result = _.pick(options, [
            'title',
            'name',
            'data',
            'accountId',
            'language',
        ]);

        Model.prepareFields({
            data: result.data,
            language: options.language
        });

        return Model.create(result);

    };

};
