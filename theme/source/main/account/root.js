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
function _e_root(app) {

  app.run(function($rootScope, LoopBackAuth, $mdDialog, $route, Account, $location) {

    $rootScope.signIn = function(credentials, cb) {

      Account.signIn(credentials, function(account) {
        LoopBackAuth.rememberMe = true;
        LoopBackAuth.setUser(account.token.id, account.token.userId);
        LoopBackAuth.save();
        onAccount(account);
        reload();
        cb(null, account);
      }, cb);
    };

    $rootScope.signOut = function(cb) {

      cb = cb || function() {

      };

      $rootScope.loadingMain = true;

      Account.signOut(function() {
        LoopBackAuth.clearUser();
        LoopBackAuth.clearStorage();
        LoopBackAuth.save();
        $rootScope.account = null;
        $rootScope.$emit('accountCheck', null);
        reload();
        cb();
        $rootScope.loadingMain = false;
      }, cb);
    };

    $rootScope.me = function(fn) {

      //TODO: Somehow reload loopback auth from storage
      //LoopBackAuth.load();

      (function(cb) {

        Account.me({}, function(data) {
          cb(data);
        });

      })(function(account) {
        onAccount(account);
        fn && fn();
      });

    };

    function onAccount(account) {

      if (account && account.email) {
        $rootScope.account = account;
      } else {
        $rootScope.account = null;
      }

      $rootScope.accountChecked = true;
      $rootScope.$emit('accountCheck', account);


    }

    function reload() {
      window.location.href = $location.path();
    }

    $rootScope.dialogLogin = function() {
      $mdDialog.open({
        partial: 'log-in'
      });
    };

    ////////////////////////////////////////////////////////////////
    // Check if User is logged in
    ////////////////////////////////////////////////////////////////

    $rootScope.me(function() {
      var result = document.getElementsByClassName('user-check');
      angular.element(result).removeClass('user-check');
    });
  });
}
