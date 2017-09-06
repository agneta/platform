/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/accounts.js
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

  var app = angular.module('MainApp');

  app.controller('AccountCtrl', function($scope, $rootScope, AccountList, $routeParams, $mdToast, $mdDialog, Production_Account, Account, $location) {

    AccountList.useScope($scope);

    function reloadAccount() {

      getAccount($scope.viewAccount.id);

    }

    function getAccount(id) {

      $location.search('account', id);

      AccountList.model.get({
        id: id
      })
        .$promise
        .then(function(account) {

          $scope.viewAccount = account;

          AccountList.model.activitiesAdmin({
            accountId: id,
            unit: 'month',
            aggregate: 'dayOfYear'
          })
            .$promise
            .then(function(result) {
              $scope.activities = result.activities;
            });

        });
    }

    if ($routeParams.account) {
      getAccount($routeParams.account);
    }

    $scope.save = function() {
      AccountList.model.update({
        data: $scope.viewAccount
      })
        .$promise
        .then(function() {

          reloadAccount();
          AccountList.loadAccounts();

          $mdToast.show({
            hideDelay: 5000,
            position: 'bottom right',
            templateUrl: 'toast-account.html'
          });
        });
    };

    //---------------------------------------------------------

    $scope.editRole = function(roleName) {

      $mdDialog.open({
        partial: 'role-' + roleName,
        data: {
          accountId: $scope.viewAccount.id,
          roleName: roleName
        }
      });

    };

    //---------------------------------------------------------

    $scope.removeRole = function(role) {

      var confirm = $mdDialog.confirm()
        .title('Role Removal')
        .textContent('Are you sure you want to remove this role?')
        .ok('Yes')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        AccountList.model.roleRemove({
          id: $scope.viewAccount.id,
          name: role,
        })
          .$promise
          .then(function() {

            reloadAccount();

          });
      }, function() {});

    };

    //---------------------------------------------------------

    $scope.addRole = function() {

      AccountList.model.roles()
        .$promise
        .then(function(roles) {

          $mdDialog.show({
            controller: function($scope, $controller, data) {
              $scope.data = data;

              angular.extend(this, $controller('DialogCtrl', {
                $scope: $scope
              }));

              $scope.submit = function() {

                $scope.loading = true;

                AccountList.model.roleAdd({
                  id: data.account.id,
                  name: $scope.role
                })
                  .$promise
                  .finally(function() {

                    $scope.loading = false;
                    reloadAccount();

                  });
              };

            },
            clickOutsideToClose: true,
            locals: {
              data: {
                roles: roles,
                account: $scope.viewAccount
              }
            },
            templateUrl: agneta.partial('role-add')
          });

        });

    };

    //------------------------------------------------------------

    $scope.change = function(account) {
      getAccount(account.id);
    };

    //------------------------------------------------------------

    $scope.createAccount = function() {

      $mdDialog.show({
        controller: function($scope, $controller) {

          angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
          }));

          $scope.submit = function() {
            $scope.loading = true;
            AccountList.model.new($scope.formSubmitFields);
          };

        },
        templateUrl: agneta.partial('account-create'),
        clickOutsideToClose: true
      });

    };

    //------------------------------------------------------------

    $scope.changePassword = function() {

      $mdDialog.open({
        partial: 'password-change-admin',
        data: {
          onFinally: function() {
            AccountList.loadAccounts();
          },
          account: $scope.viewAccount
        }
      });

    };

    //------------------------------------------------------------

    $scope.resendVerification = function() {
      AccountList.model.resendVerification({
        email: $scope.viewAccount.email
      });
    };

    //------------------------------------------------------------

    $scope.removeAccount = function() {

      var confirm = $mdDialog.confirm()
        .title('Account Removal')
        .textContent('Are you sure you want to remove this account?')
        .ok('Yes')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        AccountList.model.delete({
          id: $scope.viewAccount.id
        })
          .$promise
          .then(function() {
            AccountList.loadAccounts();
            $scope.viewAccount = null;
          });
      }, function() {});

    };
  });

})();
