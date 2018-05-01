/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/accounts/auth/cert.module.js
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
module.exports = function(options) {

  var cert = {};
  var vm = options.vm;
  var AccountList = options.AccountList;
  var $mdDialog = options.$mdDialog;

  vm.cert = cert;

  cert.load = function() {

    cert.loading = true;

    return AccountList.model.certList({
      accountId: vm.viewAccount.id
    })
      .$promise
      .then(function(result) {
        vm.cert.list = result.list;
      })
      .finally(function() {
        cert.loading = false;
      });

  };

  cert.open = function(fields) {

    $mdDialog.open({
      partial: 'account-edit-cert',
      data: {
        fields: fields,
        remove: remove,
        accountId: vm.viewAccount.id,
        onSubmit: onSubmit
      }
    });

  };

  cert.add = function() {

    $mdDialog.open({
      partial: 'account-add-cert',
      data: {
        accountId: vm.viewAccount.id,
        onSubmit: onSubmit
      }
    });

  };

  function onSubmit(promise) {
    cert.loading = true;
    promise
      .finally(function() {
        cert.load();
        cert.loading = false;
      });
  }

  function remove(id) {

    var confirm = $mdDialog.confirm()
      .title('Remove certificate')
      .textContent('Are you sure you want to remove this certificate?')
      .ok('Yes')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {

      cert.loading = true;

      AccountList.model.certRemove({
        accountId: vm.viewAccount.id,
        certId: id
      })
        .$promise
        .finally(function() {
          cert.load();
        });

    });
  }
};
