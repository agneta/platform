/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/dialog/password-lost.js
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
agneta.directive('AgPasswordLost', function(data, Account) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  vm.submit = function() {
    vm.loading = true;
    Account.requestPassword({
      email: vm.passLostFields.email,
      callback: data.callback
    }, function() {
      vm.loading = false;
    });
  };

});
