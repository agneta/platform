/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/media/beforeSave.js
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

module.exports = function(Model, app) {

  Model.observe('before save', function(ctx) {

    var instance = ctx.currentInstance || ctx.instance;
    var data = ctx.data || instance;

    return Promise.resolve()
      .then(function() {
        if (instance.type == 'folder') {
          return;
        }

        if (!instance.size && !data.size) {

          var headParams = {
            Bucket: Model.__bucket,
            Key: instance.location
          };
          return app.storage.headObject(headParams)
            .then(function(storageObjectHead) {
              data.size = storageObjectHead.ContentLength;
              //console.log('size', instance.location);
            })
            .catch(function(err) {
              console.error('error', instance, headParams);
              console.error(err);
              throw err;
            });
        }

      })
      .then(function() {
        return Model.__images.onSaveBefore(ctx);
      });

  });

};
