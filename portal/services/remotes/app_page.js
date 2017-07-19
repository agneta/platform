/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/remotes/app_page.js
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

  app.helpers.mixin('disableAllMethods', Model);

  Model.save = function(data) {

    if (!data.path) {
      return Promise.reject({
        message: 'Path is required'
      });
    }

    data.path = app.helpers.fixPath(data.path);

    return Model.findOne({
      where: {
        path: data.path
      }
    })
      .then(function(page) {
        if (page) {
          return page.updateAttributes(data);
        } else {
          return Model.create(data);
        }
      });

  };

  Model.remoteMethod(
    'save', {
      description: 'Save page data',
      accepts: [{
        arg: 'data',
        type: 'object',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/save'
      },
    }
  );
};
