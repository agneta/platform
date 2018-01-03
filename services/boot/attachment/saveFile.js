/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/attachment/saveFile.js
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
const fs = require('fs-extra');

module.exports = function(data) {


  data.saveFile = function(options) {

    var props;
    var relation = options.instance[options.prop];

    return fs.readFile(options.file.path)
      .then(function(content) {

        props = {
          name: options.file.originalname,
          size: options.file.size,
          downloadDisabled: true,
          data: content
        };

        return fs.remove(options.file.path);

      })
      .then(function() {

        return Promise.promisify(relation)();
      })
      .then(function(attachment) {
        //console.log('attachment', attachment);
        if (!attachment) {
          return relation.create(props);
        }

        return relation.update(props);
      });

  };

};
