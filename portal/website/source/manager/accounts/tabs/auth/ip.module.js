/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/accounts/auth/ip.module.js
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
agneta.directive('AgAccountIp',function(AccountList, $mdDialog) {

  var ip = {};
  var vm = this;

  vm.ip = ip;

  ip.load = function() {

    ip.loading = true;

    AccountList.model.ipList({
      accountId: vm.viewAccount.id
    })
      .$promise
      .then(function(result) {
        vm.ip.list = result.list;
      })
      .finally(function() {
        ip.loading = false;
      });

  };

  vm.$on('account-loaded',ip.load);

  if(vm.viewAccount){
    ip.load();
  }

  ip.open = function(fields) {

    $mdDialog.open({
      partial: 'account-edit-ip',
      data: {
        fields: fields,
        remove: remove,
        accountId: vm.viewAccount.id
      }
    });

  };

  ip.add = function() {

    $mdDialog.open({
      partial: 'account-add-ip',
      data: {
        onSubmit: function(form) {

          ip.loading = true;

          AccountList.model.ipAdd({
            accountId: vm.viewAccount.id,
            title: form.title,
            address: form.address
          })
            .$promise
            .finally(function() {
              ip.load();
              ip.loading = false;
            });

        }
      }
    });


  };

  function remove(id) {

    var confirm = $mdDialog.confirm()
      .title('Remove ip address')
      .textContent('Are you sure you want to remove this ip address?')
      .ok('Yes')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {

      ip.loading = true;

      AccountList.model.ipRemove({
        accountId: vm.viewAccount.id,
        ipId: id
      })
        .$promise
        .finally(function() {
          ip.load();
          ip.loading = false;
        });

    });
  }
});
