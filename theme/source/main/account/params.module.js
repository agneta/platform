/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/account/login.js
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

app.run(function($window, $location, $mdDialog, $rootScope, $routeParams, Account, LoopBackAuth) {

  var token;

  switch ($routeParams.action) {
    case 'recover-account':

      token = $routeParams.token;
      LoopBackAuth.setUser(token);

      $mdDialog.open({
        partial: 'account-recover',
      });

      break;
    case 'password-reset':

      token = $routeParams.token;
      LoopBackAuth.setUser(token);
      console.log($routeParams.token);
      $mdDialog.open({
        partial: 'password-new',
        data:{
          token: $routeParams.token
        }
      });

      break;
    case 'verify':

      var data = {
        uid: $routeParams.uid,
        token: $routeParams.token
      };

      Account.verifyEmail(data);

      break;
  }

});
