/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/content/media.module.js
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
module.exports = function(vm, AgMedia, $mdDialog, helpers) {
  var media = {};

  media.editPrivate = function(field, parent, key) {
    media.edit(field, parent, key, true);
  };

  media.editPublic = function(field, parent, key) {
    media.edit(field, parent, key, false);
  };

  media.edit = function(field, parent, key, isPrivate) {
    var parentValue = parent.__value || parent;
    var dataValue = parentValue[key].__value;
    var mediaOptions = AgMedia.public;

    if (dataValue.private && isPrivate == undefined) {
      isPrivate = true;
    }

    if (isPrivate) {
      dataValue.private = true;
      mediaOptions = AgMedia.private;
    } else {
      delete dataValue.private;
    }

    //-----------------------------
    // Select media as a default

    AgMedia.explorer({
      type: mediaOptions,
      data: {
        location: dataValue.location,
        name: field.default_name,
        dir: helpers.getBasePath(),
        onApply: onApply,
        onDelete: function() {
          vm.removeValue(key, parentValue);
        },
        config: {
          nameLock: field.default_name ? true : false,
          dirLock: true
        }
      }
    });

    //-----------------------------

    function onApply(file) {
      //console.log(file);
      dataValue.type = file.type;
      dataValue.id = file.id;
      dataValue.updatedAt = file.updatedAt;
      helpers.setFilePath(dataValue, file.location);
    }
  };

  function getMedia(data) {
    if (data.private) {
      return AgMedia.private;
    }

    return AgMedia.public;
  }

  media.backgroundImage = function(child, size) {
    var data = helpers.dataValue(child);
    var media = getMedia(data);

    if (data.location && !data.icon && data.type) {
      data.icon = media.preview.getIcon(data);
    }

    if (data.location && data.type) {
      return media.preview.backgroundImage(data, size);
    }
  };

  media.getIcon = function(child) {
    var data = helpers.dataValue(child);
    var media = getMedia(data);
    return media.preview.objectIcon(data);
  };

  media.hasBackground = function(child) {
    var data = helpers.dataValue(child);
    var media = getMedia(data);
    return media.preview.hasBackground(data);
  };

  vm.media = media;
};
