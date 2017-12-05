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

  app.controller('AccountCtrl', function($rootScope, AccountList, $routeParams, $mdToast, $mdDialog, Production_Account, Account, $location) {

    var vm = this;

    AccountList.useScope(vm);

    function reloadAccount() {
      if (!vm.viewAccount) {
        return;
      }
      getAccount(vm.viewAccount.id);

    }

    vm.reloadAccount = reloadAccount;

    function getAccount(id) {

      $location.search('account', id);
      $rootScope.loadingMain = true;

      return AccountList.model.get({
        id: id
      })
        .$promise
        .then(function(account) {

          vm.viewAccount = account;

          AccountList.model.activitiesAdmin({
            accountId: id,
            unit: 'month',
            aggregate: 'dayOfYear'
          })
            .$promise
            .then(function(result) {
              vm.activities = result.activities;
            });

          vm.ssh.load();

        })
        .finally(function() {
          $rootScope.loadingMain = false;
        });
    }

    if ($routeParams.account) {
      getAccount($routeParams.account);
    }

    vm.save = function() {
      AccountList.model.update({
        data: vm.viewAccount
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

    vm.editRole = function(roleName) {

      $mdDialog.open({
        partial: 'role-' + roleName,
        data: {
          accountId: vm.viewAccount.id,
          roleName: roleName
        }
      });

    };

    //---------------------------------------------------------

    vm.removeRole = function(role) {

      var confirm = $mdDialog.confirm()
        .title('Role Removal')
        .textContent('Are you sure you want to remove this role?')
        .ok('Yes')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        AccountList.model.roleRemove({
          id: vm.viewAccount.id,
          name: role,
        })
          .$promise
          .then(function() {

            reloadAccount();

          });
      }, function() {});

    };

    //---------------------------------------------------------

    vm.addRole = function() {

      AccountList.model.roles()
        .$promise
        .then(function(roles) {

          $mdDialog.show({
            controller: function($controller, data) {
              vm.data = data;

              angular.extend(this, $controller('DialogCtrl', {
                $scope: vm
              }));

              vm.submit = function() {

                vm.loading = true;

                AccountList.model.roleAdd({
                  id: data.account.id,
                  name: vm.role
                })
                  .$promise
                  .finally(function() {

                    vm.loading = false;
                    reloadAccount();

                  });
              };

            },
            clickOutsideToClose: true,
            locals: {
              data: {
                roles: roles,
                account: vm.viewAccount
              }
            },
            templateUrl: agneta.partial('role-add')
          });

        });

    };

    //------------------------------------------------------------

    vm.change = function(account) {
      getAccount(account.id);
    };

    //------------------------------------------------------------

    vm.createAccount = function() {

      $mdDialog.show({
        controller: function($controller) {

          angular.extend(this, $controller('DialogCtrl', {
            $scope: vm
          }));

          vm.submit = function() {
            vm.loading = true;
            AccountList.model.new(vm.formSubmitFields);
          };

        },
        templateUrl: agneta.partial('account-create'),
        clickOutsideToClose: true
      });

    };

    //------------------------------------------------------------

    vm.changePassword = function() {

      $mdDialog.open({
        partial: 'password-change-admin',
        data: {
          onFinally: function() {
            AccountList.loadAccounts();
          },
          account: vm.viewAccount
        }
      });

    };

    //------------------------------------------------------------

    vm.resendVerification = function() {
      AccountList.model.resendVerification({
        email: vm.viewAccount.email
      });
    };

    //------------------------------------------------------------

    vm.activateAccount = function() {

      var confirm = $mdDialog.confirm()
        .title('Activate Account')
        .textContent('Are you sure you want to activate this account?')
        .ok('Yes')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        AccountList.model.activateAdmin({
          id: vm.viewAccount.id
        })
          .$promise
          .then(function() {
            reloadAccount();
          });
      }, function() {});

    };

    //------------------------------------------------------------

    vm.deactivateAccount = function() {

      var confirm = $mdDialog.confirm()
        .title('Deactivate Account')
        .textContent('Are you sure you want to deactivate this account?')
        .ok('Yes')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        AccountList.model.deactivateAdmin({
          id: vm.viewAccount.id
        })
          .$promise
          .then(function() {
            reloadAccount();
          });
      }, function() {});

    };

    //------------------------------------------------------------
    // SSH Keys

    (function() {


      var ssh = {};
      vm.ssh = ssh;

      ssh.load = function() {

        ssh.loading = true;

        AccountList.model.sshList({
          accountId: vm.viewAccount.id
        })
          .$promise
          .then(function(result) {
            console.log(result);
            vm.ssh.keys = result.keys;
          })
          .finally(function() {
            ssh.loading = false;
          });

      };

      ssh.open = function() {};

      ssh.add = function() {

        $mdDialog.open({
          partial: 'ssh-add-key',
          data: {
            onSubmit: function(form) {

              ssh.loading = true;

              AccountList.model.sshAdd({
                accountId: vm.viewAccount.id,
                title: form.title,
                content: form.content
              })
                .$promise
                .finally(function() {
                  ssh.load();
                  ssh.loading = false;
                });

            }
          }
        });


      };

      ssh.remove = function(key) {

        var confirm = $mdDialog.confirm()
          .title('Remove Key')
          .textContent('Are you sure you want to remove this ssh key?')
          .ok('Yes')
          .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {

          ssh.loading = true;

          AccountList.model.sshRemove({
            accountId: vm.viewAccount.id,
            keyId: key.id
          })
            .$promise
            .finally(function() {
              ssh.load();
              ssh.loading = false;
            });

        });
      };

    })();


  });

})();
