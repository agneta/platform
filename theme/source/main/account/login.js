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
function _e_login(app) {

  app.controller('LoginController', function($scope, $window, $location, $mdDialog, $rootScope, $routeParams, Account, LoopBackAuth) {

    $location.url($location.path());
    var token;

    switch ($routeParams.action) {
      case 'recover-account':

        token = $routeParams.token;
        LoopBackAuth.setUser(token);

        $mdDialog.show({
          clickOutsideToClose: true,
          templateUrl: agneta.partial('account-recover'),
          controller: 'AccountRecoverCtrl'
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

    $scope.lostPassword = function(options) {
      options = options || {};
      $mdDialog.open({
        partial: 'password-lost',
        data: {
          callback: options.callback
        }
      });

    };

    $scope.signIn = function() {

      var email = $scope.loginFields.email;
      var password = $scope.loginFields.password;

      $scope.loading = true;

      $rootScope.signIn({
        email: email,
        password: password
      }, function(err) {

        $scope.loading = false;

        if (!err) {
          var redirect = $rootScope.viewData.extra.loginRedirect;
          if (redirect) {
            window.location.href = agneta.langPath(redirect);
          }
          return;
        }

        switch (err.code) {

          case 'LOGIN_FAILED_EMAIL_NOT_VERIFIED':
            $mdDialog.show({
              clickOutsideToClose: true,
              templateUrl: agneta.partial('warning'),
              locals: {
                data: {
                  email: email,
                  html: err.message
                }
              },
              controller: 'ResendVrfCtrl'
            });
            break;

          case 'USER_DEACTIVATED':
            $mdDialog.show({
              clickOutsideToClose: true,
              templateUrl: agneta.partial('warning'),
              locals: {
                email: email
              },
              controller: 'RequestRecoveryCtrl'
            });
            break;

          default:
            return true;
        }

      });
    };

  });

}
