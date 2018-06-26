/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/dialog/select.js
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
agneta.directive('AgMediaSelect', function(data, $mdDialog, AgMediaExplorer) {
  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  vm.startingLocation = data.file.dir;

  vm.openObject = function(object) {
    if (data.onSelect) {
      data.onSelect(object);
    }
    if (data.onApply) {
      data.onApply(object);
    }
    $mdDialog.hide();
  };

  vm.onObjects = function(objects) {
    for (var index in objects) {
      var object = objects[index];
      if (object.location == data.file.location) {
        object.selected = true;
        break;
      }
    }
  };

  AgMediaExplorer.init({
    vm: vm,
    config: data.media
  });
});
