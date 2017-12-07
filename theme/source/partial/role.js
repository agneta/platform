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

  app.agDirective('FormRole', function(data, Account) {

    var vm = this;

    agneta.extend(vm, 'AgDialogCtrl');

    vm.loading = true;
    vm.formRoleFields = {};

    vm.load = function() {

      Account.roleGetAdmin({
        accountId: data.accountId,
        roleName: data.roleName
      })
        .$promise
        .then(function(role) {
          for (var key in role) {
            vm.formRoleFields[key] = role[key];
          }
        })
        .finally(function() {
          vm.loading = false;
        });

    };

    vm.load();

    vm.update = function() {
      vm.loading = true;
      Account.roleEdit({
        accountId: data.accountId,
        roleName: data.roleName,
        data: vm.formRoleFields
      });
    };

  });

})();
