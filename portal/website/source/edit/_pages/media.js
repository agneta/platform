/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/_pages/media.js
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
(function() {

  var media = {};

  media.editPrivate = function(field, parent, key) {

    media.edit(field, parent, key, true);

  };


  media.edit = function(field, parent, key, isPrivate) {

    var parentValue = parent.__value;
    var dataValue = parentValue[key].__value;
    var mediaOptions = MediaOpt.public;

    if (dataValue.private) {
      isPrivate = true;
    }

    if (isPrivate) {
      console.log('isPrivate');
      dataValue.private = true;
      mediaOptions = MediaOpt.private;

    } else {
      delete dataValue.private;
    }

    $mdDialog.open({
      partial: mediaOptions.partial,
      data: {
        config: {
          dirLock: true
        },
        media: mediaOptions,
        location: dataValue.location,
        dir: getBasePath(field),
        onApply: function(file) {
          dataValue.type = file.type;
          dataValue.updatedAt = file.updatedAt;
          setFilePath(dataValue, file.location);
          $scope.save();
        },
        onDelete: function() {
          $scope.removeValue(key, parentValue);
          $scope.save();
        }
      }
    });

  };

  function getMedia(data) {
    if (data.private) {
      return MediaOpt.private;
    }

    return MediaOpt.public;
  }

  media.backgroundImage = function(child) {

    var data = dataValue(child);
    var media = getMedia(data);

    if (data.location && !data.icon && data.type) {
      data.icon = media.preview.getIcon(data);
    }

    if (data.location && data.type) {
      return media.preview.backgroundImage(data);
    }

  };

  media.getIcon = function(child) {
    var data = dataValue(child);
    var media = getMedia(data);
    return media.preview.objectIcon(data);
  };

  media.hasBackground = function(child) {
    var data = dataValue(child);
    var media = getMedia(data);
    return media.preview.hasBackground(data);
  };

  $scope.media = media;

})();
