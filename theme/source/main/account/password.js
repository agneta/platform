/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/account/password.js
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
function _e_password(app) {

  app.agDirective('AgPassLostCtrl', function(data, Account) {

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

  app.agDirective('AgPassChangeCtrl', function($rootScope, $mdDialog, LoopBackAuth, Account) {

    var vm = this;

    agneta.extend(vm, 'AgDialogCtrl');

    vm.submitPassword = function() {

      vm.loading = true;

      Account.passwordChange(vm.formPassFields)
        .$promise
        .then(function(res) {

          vm.loading = false;
          var credentials = {
            email: res.email,
            password: vm.formPassFields.password_new
          };
          $rootScope.signIn(credentials);

        });

    };

  });

}
