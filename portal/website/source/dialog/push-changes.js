/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/dialog/push-changes.js
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

  agneta.directive('AgPushChanges', function(GIT, data) {
    var vm = this;
    var helpers = data.helpers;

    agneta.extend(vm, 'AgDialogCtrl');

    vm.loading = true;
    GIT.status()
      .$promise
      .then(function(result) {
        //console.log(result);
        vm.files = result.files;
      })
      .finally(function() {
        vm.loading = false;
      });

    vm.submit = function() {
      vm.loading = true;
      GIT.push({
        message: vm.formSubmitFields.message
      })
        .$promise
        .then(function() {
          vm.close();
          helpers.toast('Changes are pushed to repository');
        })
        .finally(function() {
          vm.loading = false;
        });
    };
  });

})();
