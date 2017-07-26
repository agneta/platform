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
(function() {

  app.controller('PassLostCtrl', function($scope, $controller,data, Account) {

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    $scope.submit = function() {
      $scope.loading = true;
      Account.requestPassword({
        email: $scope.passLostFields.email,
        callback: data.callback
      }, function() {
        $scope.loading = false;
      });
    };

  });

  app.controller('PassChangeCtrl', function($scope, $rootScope, $mdDialog, $controller, LoopBackAuth, Account) {

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    $scope.submitPassword = function() {

      $scope.loading = true;

      Account.passwordChange($scope.formPassFields)
        .$promise
        .then(function(res) {

          $scope.loading = false;
          var credentials = {
            email: res.email,
            password: $scope.formPassFields.password_new
          };
          $rootScope.signIn(credentials);

        });

    };

  });

})();
