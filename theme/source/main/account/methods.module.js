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

  account.signIn = function(credentials) {

    Account.signIn(credentials)
      .$promise
      .then(function(account) {
        LoopBackAuth.rememberMe = true;
        LoopBackAuth.setUser(account.token.id, account.token.userId);
        LoopBackAuth.save();
        onAccount(account);
        reload();
      })
      .catch(function(err){
        switch (err.code) {
          case 'LOGIN_FAILED_EMAIL_NOT_VERIFIED':
            $mdDialog.show({
              partial: 'account-unverified',
              data: {
                email: credentials.email,
                html: err.message
              }
            });
            break;
          case 'USER_DEACTIVATED':
            $mdDialog.show({
              clickOutsideToClose: true,
              partial: 'account-deactivated',
              data: {
                email: credentials.email
              }
            });
            break;

          default:
            break;
        }
      });
  };

  account.signOut = function(cb) {

    cb = cb || function() {

    };

    $rootScope.loadingMain = true;

    Account.signOut(function() {
      LoopBackAuth.clearUser();
      LoopBackAuth.clearStorage();
      LoopBackAuth.save();
      $rootScope.account.profile = null;
      $rootScope.$emit('accountCheck', null);
      reload();
      cb();
      $rootScope.loadingMain = false;
    }, cb);
  };

  account.me = function() {

    //TODO: Somehow reload loopback auth from storage
    //LoopBackAuth.load();

    return Account.me({})
      .$promise
      .then(function(account){
        onAccount(account);
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

  function onAccount(account) {

    if (account && account.email) {
      $rootScope.account.profile = account;
    } else {
      $rootScope.account.profile = null;
    }

    $rootScope.account.checked = true;
    $rootScope.$emit('accountCheck', account);

  }

  function reload() {
    window.location.href = $location.path();
  }

  account.login = function() {
    $mdDialog.open({
      partial: 'account-login'
    });
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
