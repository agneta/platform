/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/account/root.js
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
var app = window.angular.module('MainApp');

app.run(function($rootScope, LoopBackAuth, $mdDialog, $route, Account, $location) {

  var account = {};
  $rootScope.account = account;

  account.me = function() {

    //TODO: Somehow reload loopback auth from storage
    //LoopBackAuth.load();
    return Account.me()
      .$promise
      .then(function(result){
        account.profile = result;
      });

  };

  account.lostPassword = function(options) {
    options = options || {};
    $mdDialog.open({
      partial: 'password-lost',
      data: {
        callback: options.callback
      }
    });
  };

  $rootScope.$watch('account.profile',function(value){

    if (!value || !value.email) {
      account.profile = null;
      return;
    }

    account.checked = true;
    $rootScope.$emit('accountCheck', value);

  });

  function reload() {
    window.location.href = $location.path();
  }

  account.login = function() {
    $mdDialog.open({
      partial: 'account-login'
    });
  };

  account.logout = function(cb) {

    cb = cb || function() {

    };

    $rootScope.loadingMain = true;

    Account.signOut(function() {
      LoopBackAuth.clearUser();
      LoopBackAuth.clearStorage();
      LoopBackAuth.save();
      account.profile = null;
      $rootScope.$emit('accountCheck', null);
      reload();
      cb();
      $rootScope.loadingMain = false;
    }, cb);
  };


  ////////////////////////////////////////////////////////////////
  // Check if User is logged in
  ////////////////////////////////////////////////////////////////

  account.me()
    .finally(function() {
      var result = document.getElementsByClassName('user-check');
      angular.element(result).removeClass('user-check');
    });
});
