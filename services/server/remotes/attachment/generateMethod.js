/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/attachment/generateMethod.js
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
const multer = require('multer');

var uploadSingle = multer({
  dest: 'temp/uploads/attachments'
})
  .single('object');


module.exports = function(Model) {

  Model.__generateMethod = function(options) {

    options = options || {};

    if (!options.model) {
      throw new Error('Must provide a model');
    }

    var model = options.model;
    var name = options.name || 'uploadFile';

    //------------------------------------------------
    // Generate remote method

    var pathRemote = options.path || '/upload-file';

    model.beforeRemote(name, function(context, instance, next) {
      uploadSingle(context.req, context.res, next);
    });

    model.remoteMethod(
      name, {
        description: 'Upload a single file',
        accepts: [{
          arg: 'req',
          type: 'object',
          'http': {
            source: 'req'
          }
        }],
        returns: {
          arg: 'result',
          type: 'object',
          root: true
        },
        http: {
          verb: 'post',
          path: pathRemote
        }
      }
    );

  };
};
