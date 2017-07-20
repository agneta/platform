/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/partial/role.js
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

  var app = window.angular.module('MainApp');

  app.controller('FormRole', function($scope, $controller, data, Account) {

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    $scope.loading = true;
    $scope.formRoleFields = {};

    function load() {

      Account.roleGet({
        accountId: data.accountId,
        roleName: data.roleName
      })
        .$promise
        .then(function(role) {
          for (var key in role) {
            $scope.formRoleFields[key] = role[key];
          }
        })
        .finally(function() {
          $scope.loading = false;
        });

    }

    load();

    $scope.update = function() {
      $scope.loading = true;
      Account.roleEdit({
        accountId: data.accountId,
        roleName: data.roleName,
        data: $scope.formRoleFields
      });
    };

  });

})();
