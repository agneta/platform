/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media_private.js
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
module.exports = function(Model, app) {

  var config = app.web.services.get('storage');
  var prjHelpers = app.client.app.locals;

  Model._url = prjHelpers.prv_media;

  require('./media/main')(Model, app, {
    name: 'private',
    bucket: config.buckets.media.private
  });

};
