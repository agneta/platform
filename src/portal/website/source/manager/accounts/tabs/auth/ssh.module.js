/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/accounts/auth/ssh.module.js
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
agneta.directive('AgAccountSsh',function(AccountList, $mdDialog) {
  var ssh = {};
  var vm = this;

  vm.ssh = ssh;

  ssh.load = function() {

    ssh.loading = true;

    AccountList.model.sshList({
      accountId: vm.viewAccount.id
    })
      .$promise
      .then(function(result) {
        vm.ssh.keys = result.keys;
      })
      .finally(function() {
        ssh.loading = false;
      });

  };

  vm.$on('account-loaded',ssh.load);

  if(vm.viewAccount){
    ssh.load();
  }

  ssh.open = function() {};

  ssh.add = function() {

    $mdDialog.open({
      partial: 'account-add-ssh',
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
});
