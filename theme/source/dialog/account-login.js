/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/dialog/account-login.js
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
agneta.directive('AgAccountLogin', function($rootScope, $mdDialog,$location, Account, LoopBackAuth) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  vm.register = function() {
    $rootScope.account.register();
  };

  vm.lostPassword = function() {
    $rootScope.account.lostPassword();
  };

  vm.submit = function() {

    var email = vm.formLoginFields.email;
    var password = vm.formLoginFields.password;

    vm.loading = true;

    Account.signIn({
      email: email,
      password: password
    })
      .$promise
      .then(function(account) {
        LoopBackAuth.rememberMe = true;
        LoopBackAuth.setUser(account.token.id, account.token.userId);
        LoopBackAuth.save();
        $rootScope.account.profile = account;

        var searchData = $location.search();
        delete searchData.uid;
        delete searchData.token;
        delete searchData.action;
        $location.search(searchData);

        window.location.href = $location.url();
      })
      .catch(function(err){
        switch (err.code) {
          case 'LOGIN_FAILED_EMAIL_NOT_VERIFIED':
            $mdDialog.open({
              partial: 'account-unverified',
              nested: true,
              data: {
                email: email,
                html: err.message
              }
            });
            break;
          case 'USER_DEACTIVATED':
            $mdDialog.open({
              partial: 'account-deactivated',
              nested: true,
              data: {
                email: email
              }
            });
            break;

          default:
            break;
        }
      })
      .finally(function() {
        vm.loading = false;
      });
  };

});
