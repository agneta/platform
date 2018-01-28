/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/account/directives.js
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

app.directive('hasRole', function($rootScope) {
  return {
    restrict: 'A',
    scope: true,
    link: function(scope, element, attrs) {

      var parent = element.parent();
      parent.addClass('has-role');

      if (attrs.$attr.roleHide) {
        parent.addClass('role-hide');
      }

      function check() {

        var account = $rootScope.account.profile;
        if (!account) {
          return;
        }

        var roles = JSON.parse(attrs.hasRole) || [];
        var hasRoles = [];

        for (var index in roles) {

          var role = roles[index];
          var hasRole = account[role];
          hasRole = hasRole && hasRole.id;

          if (hasRole) {
            hasRoles.push(role);
          }
        }

        if (hasRoles.length) {
          parent.removeClass('has-no-role');
        } else {
          parent.addClass('has-no-role');
        }

      }

      check();

      $rootScope.$on('accountCheck', check);


    }
  };
});
