/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/_pages/source.js
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

/*global jsyaml:true*/

function _e_source(vm, $mdDialog,$timeout) {

  vm.openSource = function() {

    $mdDialog.open({
      partial: 'page-source',
      data: {
        onDone: function(newVal) {

          if (!vm.page) {
            return;
          }
          var data;
          try {
            data = jsyaml.safeLoad(newVal);
          } catch (e) {
            return;
          }
          vm.page.data = null;

          $timeout(function() {
            vm.page.data = data;
          }, 100);

        },
        getData: function() {
          vm.clearHiddenData();
          var data = angular.copy(vm.page.data);
          delete data.undefined;
          return jsyaml.dump(data);
        }
      }
    });
  };

}
