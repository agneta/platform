/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/accounts/tokens.module.js
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
agneta.directive('AgAccountTokens',function(AccountList, $mdDialog) {

  var vm = this;
  var tokens = vm.tokens = {};

  vm.$on('account-loaded',load);

  if(vm.viewAccount){
    load();
  }

  function load() {

    tokens.loading = true;

    AccountList.model.tokenList({
      accountId: vm.viewAccount.id
    })
      .$promise
      .then(function(result) {
        vm.tokens.list = result.list;
      })
      .finally(function() {
        tokens.loading = false;
      });

  }

  tokens.delete = function(token) {

    var confirm = $mdDialog.confirm()
      .title('Remove Token')
      .textContent('Are you sure you want to remove this token?')
      .ok('Yes')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      tokens.loading = true;

      AccountList.model.tokenRemove({
        id: token.id
      })
        .$promise
        .finally(function(){
          return tokens.load();
        });

    });

  };

});
