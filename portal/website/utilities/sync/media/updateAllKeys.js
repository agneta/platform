/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/sync/media/updateAllKeys.js
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
const Promise = require('bluebird');
const path = require('path');
const probe = require('probe-image-size');

module.exports = function(options) {

  let services= options.services;
  let foundObjects= options.foundObjects;
  let foundFolders= options.foundFolders;
  let Media= options.model;
  let util= options.util;
  let bucket= options.bucket;
  let helpers = util.locals.app.locals;
  var barListAllKeys;

  barListAllKeys = util.progress(0, {
    title: 'Checking all locations. Create or update if there is a change.'
  });

  return list();

  function list(marker) {
    var storage = services.storage;

    return storage.listObjects({
      Bucket: bucket,
      Marker: marker
    })
      .then(function(data) {

        barListAllKeys.addLength(data.Contents.length);

        return Promise.map(data.Contents, function(storageObject) {

          foundObjects[storageObject.Key] = true;
          var pathParsed = path.parse(storageObject.Key);

          while (pathParsed.dir.length) {
            foundFolders[pathParsed.dir] = true;
            pathParsed = path.parse(pathParsed.dir);
          }

          return Media.findOne({
            where: {
              location: storageObject.Key
            },
            fields: {
              id: true,
              location: true
            }
          })
            .then(function(objectDB) {

              var fields;

              //--------------------------------------------------------
              // Update Object

              if (objectDB) {
                return getFields()
                  .then(function(_fields) {

                    fields = _fields;

                    if(objectDB.image &&
                      objectDB.image.width &&
                      objectDB.image.height){
                      return;
                    }

                    return getImageSize(fields);


                  })
                  .then(function() {

                    var update = false;

                    for (var key in fields) {
                      if (fields[key] != objectDB[key]) {
                        update = true;
                        break;
                      }
                    }

                    if (!update) {
                      return;
                    }
                    //console.log('about to update', fields, Media.definition.name);
                    return objectDB.updateAttributes(fields)
                      .then(function(objectDB) {
                        util.log('Updated: ' + objectDB.location);
                      });

                  });


              }

              //--------------------------------------------------------
              // Create Object

              return getFields()
                .then(function(_fields) {
                  fields = _fields;
                  return getImageSize(fields);
                })
                .then(function() {
                  return Media.create(fields);
                })
                .then(function(objectDB) {
                  util.log('Created: ' + objectDB.location);
                });

              //-------------------------------------------------

              function getImageSize(fields) {

                if(fields.type!='image'){
                  return;
                }

                if(!fields.size){
                  return;
                }

                return probe(helpers.get_media(fields.location))
                  .then(function(size){
                    fields.image = {
                      width: size.width,
                      height: size.height
                    };
                    console.log(fields.location,'Image:',fields.image);
                  });
              }

              //-------------------------------------------------

              function getFields() {
                return storage.headObject({
                  Bucket: bucket,
                  Key: storageObject.Key
                })
                  .then(function(storageObjectHead) {

                    return {
                      name: path.parse(storageObject.Key).name,
                      location: storageObject.Key,
                      size: storageObjectHead.ContentLength,
                      contentType: storageObjectHead.ContentType,
                      type: services.helpers.mediaType(storageObjectHead.ContentType)
                    };
                  });
              }



            })
            .catch(function(err){
              util.error(`Error for location: ${storageObject.Key}`);
              return Promise.reject(err);
            })
            .then(function() {
              barListAllKeys.tick({
                title: storageObject.Key
              });
            });
        }, {
          concurrency: 20
        })
          .then(function() {
            if (data.IsTruncated) {
              return list(_.last(data.Contents).Key);
            }
          });
      });
  }
};
