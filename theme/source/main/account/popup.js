/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/account/popup.js
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
function _e_popup(app) {
  app.page('PopupLoginCtrl', function($rootScope, $mdDialog, $controller) {

    var vm = this;

    angular.extend(this, $controller('DialogCtrl', {
      $scope: vm
    }));

    vm.submit = function() {

      var email = vm.formLoginFields.email;
      var password = vm.formLoginFields.password;

      vm.loading = true;

      $rootScope.signIn({
        email: email,
        password: password
      },
      function(err) {

        vm.loading = false;

        if (err) {
          return;
        }

        $mdDialog.hide();

      });
    };

  });
}
