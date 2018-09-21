/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/storage/amazon.js
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

module.exports = function(app) {
  var services = app.web.services;
  var s3 = services.aws.s3;
  return {
    listObjects: function() {
      return s3.listObjectsV2.apply(s3, arguments).promise();
    },
    headObject: function() {
      return s3.headObject.apply(s3, arguments).promise();
    },
    copyObject: function() {
      return s3.copyObject.apply(s3, arguments).promise();
    },
    deleteObjects: function() {
      return s3.deleteObjects.apply(s3, arguments).promise();
    },
    deleteObject: function() {
      return s3.deleteObject.apply(s3, arguments).promise();
    },
    getObjectStream: function() {
      return s3.getObject.apply(s3, arguments).createReadStream();
    },
    upload: function(options) {
      var upload = s3.upload.apply(s3, arguments);
      if (options.onProgress) {
        upload.on('httpUploadProgress', options.onProgress);
      }
      return upload.promise();
    }
  };
};
