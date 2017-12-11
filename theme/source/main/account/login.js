/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/account/login.js
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
function _e_login() {

  agneta.directive('LoginController', function($window, $location, $mdDialog, $rootScope, $routeParams, Account, LoopBackAuth) {

    var token;
    var vm = this;

    switch ($routeParams.action) {
      case 'recover-account':

        token = $routeParams.token;
        LoopBackAuth.setUser(token);

        $mdDialog.show({
          clickOutsideToClose: true,
          templateUrl: agneta.dialog('account-recover'),
          controller: 'AgAccountRecoverCtrl'
        }).then(function() {
          LoopBackAuth.clearUser();
          LoopBackAuth.clearStorage();
        });

        break;
      case 'password-reset':

        token = $routeParams.token;
        LoopBackAuth.setUser(token);

        $mdDialog.open({
          partial: 'password-new'
        });

        break;
      case 'verify':

        var data = {
          uid: $routeParams.uid,
          token: $routeParams.token
        };

        Account.verifyEmail(data);

        break;
    }

    vm.lostPassword = function(options) {
      options = options || {};
      $mdDialog.open({
        partial: 'password-lost',
        data: {
          callback: options.callback
        }
      });

    };

    vm.signIn = function() {

      var email = vm.loginFields.email;
      var password = vm.loginFields.password;

      vm.loading = true;

      $rootScope.signIn({
        email: email,
        password: password
      }, function(err) {

        vm.loading = false;

        if (!err) {

          var redirect = $routeParams.redirect;

          if(redirect){
            redirect = agneta.langPath($routeParams.redirect);
          }

          if (!redirect) {
            redirect = agneta.langPath($rootScope.viewData.extra.loginRedirect);
          }

          if (redirect) {
            $window.location.href = redirect;
          }

          return;
        }

        switch (err.code) {

          case 'LOGIN_FAILED_EMAIL_NOT_VERIFIED':
            $mdDialog.show({
              clickOutsideToClose: true,
              templateUrl: agneta.dialog('warning'),
              locals: {
                data: {
                  email: email,
                  html: err.message
                }
              },
              controller: 'AgResendVrfCtrl'
            });
            break;

          case 'USER_DEACTIVATED':
            $mdDialog.show({
              clickOutsideToClose: true,
              templateUrl: agneta.dialog('warning'),
              locals: {
                email: email
              },
              controller: 'AgRequestRecoveryCtrl'
            });
            break;

          default:
            return true;
        }

      });
    };

  });

}
