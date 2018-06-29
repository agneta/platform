/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/helpers/images.js
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

const _ = require('lodash');

module.exports = function(Model, app) {
  Model.__images = {};

  Model.__images.sizes = app.web.services.get('media').sizes;
  Model.__images.sizeKeys = _.keys(Model.__images.sizes);

  require('./onDelete')(Model, app);
  require('./onSaveAfter')(Model, app);
  require('./onSaveBefore')(Model, app);
  require('./onUpdate')(Model, app);
  require('./onUpload')(Model, app);
};
