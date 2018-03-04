/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/storage/local.js
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

const path = require('path');

module.exports = function(app) {

  var webPrj = app.get('options').client.project;
  var root = path.join(webPrj.paths.core.storage);

  var data = {
    root: root
  };

  return {
    listObjects: require('./listObjects')(data),
    headObject: function() {},
    copyObject: function() {},
    deleteObjects: function() {},
    deleteObject: function() {},
    getObjectStream: function() {},
    upload: require('./upload')(data)
  };
};
