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

require('./overview/index.module');

require('./tabs/roles/index.module');
require('./tabs/tokens/index.module');
require('./tabs/activities/index.module');
require('./tabs/edit/index.module');

require('./tabs/auth/ssh.module');
require('./tabs/auth/ip.module');
require('./tabs/auth/cert.module');

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
        vm.$broadcast('account-loaded',account);

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

});
