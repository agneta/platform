/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/media/helpers/prepareObject.js
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
const mime = require('mime-types');
const prettyBytes = require('pretty-bytes');

module.exports = function(Model, app) {

  var prjHelpers = app.get('options').client.app.locals;

  Model.__prepareObject = function(object) {

    if (!object) {
      return;
    }

    var dir = object.location.split('/');
    dir.pop();
    dir = dir.join('/');

    object.dir = dir;

    switch (object.type) {
      case 'folder':
        return object;
    }

    object.url = prjHelpers.prv_media(object.location);
    object.size = object.size ? prettyBytes(parseFloat(object.size)) : null;
    object.type = app.helpers.mediaType(object.contentType);
    object.ext = mime.extension(object.contentType);

    return object;
  };

};
