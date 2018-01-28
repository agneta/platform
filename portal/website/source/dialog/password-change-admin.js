/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/dialog/password-change-admin.js
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

  agneta.directive('AgPassChangeAdminCtrl', function(data, $rootScope, Account, LoopBackAuth) {

    var vm = this;

    //console.log(data);
    agneta.extend(vm, 'AgDialogCtrl');

    vm.submitPassword = function() {

      vm.loading = true;

      Account.changePasswordAdmin({
        password: vm.formPassFields.password_new,
        accountId: data.account.id
      })
        .$promise
        .then(function() {

          if (data.account.id == $rootScope.account.profile.id) {
            LoopBackAuth.clearUser();
            LoopBackAuth.save();
            $rootScope.me();
          }

        })
        .finally(function() {
          vm.loading = true;
          data.onFinally();
        });
    };
  });
})();
