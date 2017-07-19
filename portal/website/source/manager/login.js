/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/login.js
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

  var agneta = window.agneta;
  var angular = window.angular;
  var app = angular.module('MainApp');

  app.controller('LoginController', function($scope, $window, $location, $mdDialog, $rootScope, $routeParams, Account, LoopBackAuth) {

    $scope.lostPassword = function() {

      $mdDialog.show({
        clickOutsideToClose: true,
        templateUrl: agneta.partial('password-lost'),
        controller: 'PassLostCtrl'
      });

    };

    $scope.signIn = function() {

      var email = $scope.loginFields.email;
      var password = $scope.loginFields.password;

      $scope.loading = true;

      $rootScope.signIn({
        email: email,
        password: password
      },
      function() {
                    
        $scope.loading = false;

      });
    };

  });

})();