/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/attachment/generatePrototype.js
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
const Promise = require('bluebird');


module.exports = function(Model) {

  Model.__generatePrototype = function(options) {

    options = options || {};

    if (!options.model) {
      throw new Error('Must provide a model');
    }

    var model = options.model;
    var name = options.name || 'uploadFile';

    model.prototype[name] = function(req) {

      var self = this;

      return Promise.resolve()
        .then(function() {
          //console.log('about to prepare file', data);
          return Model.__saveFile({
            model: model,
            instance: self,
            prop: options.prop,
            file: req.file
          });
        })
        .then(function() {

          return {
            success: 'File is uploaded'
          };

        });

    };

  };
};
