/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/accounts/list.js
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
var app = angular.module('MainApp');

app.service('AccountList', function($rootScope, Production_Role_Account_Manager, Role_Account_Manager, $timeout) {

  var accounts = {};
  var self = this;
  var search = {
    loading: false
  };

  function check() {
    if(!$rootScope.isProduction){
      return;
    }
    var AccountModel = $rootScope.isProduction() ? Production_Role_Account_Manager : Role_Account_Manager;
    self.model = AccountModel;
  }

  $rootScope.$on('productionMode', function() {
    check();
    self.loadAccounts();
  });

  this.loadAccounts = function(result) {

    if(!self.model){
      return;
    }

    if (result) {
      accounts.list = result.accounts;
      accounts.count = result.count;
      return;
    }

    self.model.recent({
      limit: 20
    })
      .$promise
      .then(function(recent) {
        //console.warn('loadAccounts',recent);
        search.active = false;
        accounts.count = recent.count;
        accounts.list = recent.list;
      });

  };

  if (!accounts.list) {
    $timeout(function() {
      check();
      self.loadAccounts();
    });
  }

  search.query = function() {

    if (!search.text) {
      return;
    }
    search.loading = true;
    search.active = true;

    self.model.search({
      query: search.text
    })
      .$promise
      .then(function(result) {
        $timeout(function() {
          search.loading = false;
        }, 400);
        accounts.list = result.accounts;
      });
  };

  search.clear = function() {
    self.loadAccounts();
  };

  //------------------------------------

  self.useScope = function(vm) {

    vm.search = search;
    vm.accounts = accounts;

  };

});
