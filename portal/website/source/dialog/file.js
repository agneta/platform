/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/dialog/file.js
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

agneta.directive('AgEditFile', function(data, EditFile,AgMedia) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  data.config = data.config || {};

  //-------------------------------------------------------------

  data.media = data.media || AgMedia.public;
  var MediaPreview = data.media.preview;

  //-------------------------------------------------------------

  if (data.location && !data.dir) {
    var dir = data.location.split('/');
    dir.pop();
    data.dir = dir.join('/');
  }

  vm.getIcon = function() {

    var icon = MediaPreview.objectIcon(vm.file);
    if (!icon) {
      icon = agneta.get_media('icons/agneta/media');
    }
    return icon;
  };

  EditFile.init({
    data: data,
    scope: vm,
    onFile: function(file) {
      //console.log('EditFile.init',file);
      if (file.location) {
        vm.preview_src = MediaPreview.image(file, 'medium');
      }

      if (data.onFile) {
        data.onFile(file);
      }
    }
  });

});
