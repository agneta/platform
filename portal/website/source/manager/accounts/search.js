/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/accounts/search.js
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

  agneta.directive('SearchAccounts', function(AccountList, $rootScope, $mdDialog, Production_Account, Account, $location) {

    var vm = this;

    AccountList.useScope(vm);

    var filters = {};

    vm.select = function(account){
      $location.path(agneta.langPath('manager/accounts')).search({
        account: account.id
      });
    };

    vm.filter = function(){

      $mdDialog.open({
        partial: 'filter-account',
        data:{
          filters: filters,
          onApply: function(filters){
            console.log(filters);

            var options = {};

            for(var key in filters){
              var filter = filters[key];
              if(filter.enabled){
                options[key] = filter.value || false;
              }
            }

            return AccountList.model.filter({
              options: options
            })
              .$promise
              .then(function(result){

                AccountList.loadAccounts(result);

                console.log(result);
              });
          }
        }
      });
    };

  });

})();
