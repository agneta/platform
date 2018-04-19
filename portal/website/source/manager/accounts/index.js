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

  agneta.directive('AgAccountCtrl', function($rootScope, AccountList, $routeParams, $mdToast, $mdDialog, Production_Account, $timeout, Account, $location) {
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

          AccountList.model.activities({
            accountId: id,
            unit: 'month',
            aggregate: 'dayOfYear'
          })
            .$promise
            .then(function(result) {
              vm.activities = result.activities;
            });
          vm.$broadcast('account-loaded',account);
          vm.ssh.load();
          vm.tokens.load();
          vm.ip.load();
          vm.cert.load();

        })
        .finally(function() {
          $rootScope.loadingMain = false;
        });
    }

    if ($routeParams.account) {
      $timeout(function() {
        getAccount($routeParams.account);
      }, 100);
    }

    vm.change = function(account) {
      getAccount(account.id);
    };

    vm.createAccount = function() {
      $mdDialog.open({
        partial: 'account-create'
      });
    };

    //------------------------------------------------------------

    var shared = {
      vm: vm,
      AccountList: AccountList,
      $mdDialog: $mdDialog,
      $mdToast: $mdToast,
      reloadAccount: reloadAccount
    };

    require('manager/accounts/roles.module')(shared);
    require('manager/accounts/tokens.module')(shared);
    require('manager/accounts/overview.module')(shared);
    require('manager/accounts/edit.module')(shared);

    require('manager/accounts/auth/ssh.module')(shared);
    require('manager/accounts/auth/ip.module')(shared);
    require('manager/accounts/auth/cert.module')(shared);


  });

})();
