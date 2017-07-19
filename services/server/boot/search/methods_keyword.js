/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/search/methods_keyword.js
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
module.exports = function(Model, app,models) {

    app.helpers.runRemote({
        model: Model
    });


    Model.get = function(lang) {
        return Model.find({
            fields: {
                id: true,
                value: true
            },
            where: {
                lang: lang
            }
        });
    };


    //---------------------------------------------------------

    Model.clear = function() {
        return app.helpers.dropCollection([
                models.keyword.definition.name,
                //models.source.definition.name,
                models.position.definition.name,
                models.field.definition.name
            ])
            .then(function() {
                return {
                    success: 'Deleted Keywords, Positions, and Fields'
                };
            });
    };
};
