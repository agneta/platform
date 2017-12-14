/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/helpers/prepareFile.js
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
const S = require('string');
const path = require('path');
const fs = require('fs-extra');

module.exports = function(Model, app) {

  Model.__prepareFile = function(file, options) {

    var params = Model.__fixParams(file, options);

    var name = params.name;
    var dir = params.dir;
    var location = params.location;

    if (location) {
      var parsedLocation = path.parse(location);
      dir = parsedLocation.dir;
      name = parsedLocation.name;
    } else {

      if (!name) {
        name = path.parse(file.originalname).name;
      }

      name = S(name).slugify().s;
      location = Model.__getMediaPath(dir, name);
    }

    //console.log('prepare file', location, dir);

    var type = app.helpers.mediaType(file.mimetype);
    var stream = fs.createReadStream(file.path);

    //-----------------------------------------------

    return Model.__sendFile({
      location: location,
      type: type,
      size: file.size,
      mimetype: file.mimetype,
      stream: stream
    })
      .then(function(result) {

        fs.unlinkAsync(file.path);
        return Model.__prepareObject(result);

      })
      .catch(function(error) {
        console.error(error);
        Model.io.emit('file:upload:error', error);
      });
  };
};
