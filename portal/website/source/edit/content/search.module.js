/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/content/search.module.js
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

module.exports = function(vm, $timeout) {

  vm.onSearch = function(value) {

    var scopeName;

    if (vm.pages) {
      scopeName = 'pages';
    }
    if (vm.templates) {
      scopeName = 'templates';
    }

    if (!value) {


      vm[scopeName] = null;
      $timeout(function() {
        vm[scopeName] = vm.itemsLoaded;
      }, 100);

      return;
    }

    var result = vm.fuse.search(value).slice(0, 6);
    vm[scopeName] = result;
  };

};
