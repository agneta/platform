/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/dialog/file-private.js
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
/*global Fuse*/

agneta.directive('AgEditFilePrivate', function(data, AgMedia, Role_Account_Manager) {

  var onFile = data.onFile;
  var vm = this;
  var items;
  var fuse;

  data.onFile = function(file) {
    file.roles = file.roles || [];
    if (onFile) {
      onFile(file);
    }
  };

  data.media = AgMedia.private;

  vm.loading = true;
  Role_Account_Manager.roles()
    .$promise
    .then(function(result) {
      vm.loading = false;

      items = result;
      fuse = new Fuse(items, {
        shouldSort: true,
        keys: ['name']
      });

    });

  var roles = {
    items: items,
    query: function(query) {
      if (!items) {
        return;
      }
      var results = query ? fuse.search(query) : items;

      var roles = [];
      for (var key in results) {
        roles.push(results[key].name);
      }

      return roles;
    }
  };

  vm.roles = roles;

  agneta.extend(vm, 'AgEditFile', {
    data: data
  });

});
