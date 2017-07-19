/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/remotes/media/uploadFiles.js
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
const multer = require('multer');

module.exports = function(Model) {

  var uploadArray = multer({
          dest: Model.__tempUploads
      })
      .array('objects');

    Model.uploadFiles = function(req) {

        var data = Model.__uploadData(req);
        var count = 0;

        Promise.map(req.files, function(file) {
                return Model.__prepareFile(file, {
                        dir: data.dir
                    })
                    .then(function() {
                        count++;
                        Model.io.emit('files:upload:progress', {
                            count: count,
                            total: req.files.length
                        });

                        return file.id;
                    });
            }, {
                concurrency: 5
            })
            .then(function(files) {
                Model.io.emit('files:upload:complete', files);
            });


        return Promise.resolve({
            _success: "Files are uploading to your storage service"
        });

    };

    Model.beforeRemote('uploadFiles', function(context, instance, next) {
        uploadArray(context.req, context.res, next);
    });

    Model.remoteMethod(
        'uploadFiles', {
            description: "Upload an array of files",
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
                path: '/upload-files'
            }
        }
    );

};
