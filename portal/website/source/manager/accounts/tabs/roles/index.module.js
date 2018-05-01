/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/accounts/roles.module.js
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
module.exports = function(options){

  var vm = options.vm;
  var AccountList = options.AccountList;
  var $mdDialog = options.$mdDialog;
  var reloadAccount = options.reloadAccount;

  //---------------------------------------------------------

  vm.editRole = function(roleName) {

    $mdDialog.open({
      partial: 'role-' + roleName,
      data: {
        accountId: vm.viewAccount.id,
        roleName: roleName,
        reloadAccount: reloadAccount
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

        $mdDialog.open({
          partial: 'role-add',
          data: {
            roles: roles,
            account: vm.viewAccount,
            reloadAccount: reloadAccount
          }
        });

      });

  };


};
