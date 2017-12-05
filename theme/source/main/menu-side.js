/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/menu-side.js
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
function _e_menuSide(app) {

  var menu;

  app.run(function($rootScope) {
    Object.defineProperty($rootScope, 'hasMenu', {
      get: function() {
        return Boolean(menu);
      }
    });
  });


  app.directive('menuSide', function($rootScope, $timeout,$route, $mdSidenav, $mdMedia, $http, $compile, $log) {
    return {
      link: function(vm) {

        var locked = false;
        $rootScope.menu = {};
        $rootScope.$on('$routeChangeSuccess', onRoute);

        function onRoute(event, current) {

          $timeout(function() {

            menu = $mdSidenav('menu');
            locked = current && current.locals.data.menuLock;
            //contentElement.empty();

            if ($mdMedia('gt-sm')) {

              if (locked) {
                $rootScope.menu.show();
              } else {
                remove();
              }

            }

          }, 10);


        }

        onRoute(null, $route.current);

        function remove() {
          $rootScope.menu.hide();
          $timeout(function() {
            vm.sidebarHTML = null;
          }, 1400);
        }

        vm.menuLock = function() {
          $rootScope.menu.isLocked = locked && $mdMedia('gt-sm');
          return $rootScope.menu.isLocked;
        };

        $rootScope.menu.toggle = function() {
          return menu.toggle();
        };

        $rootScope.menu.show = function() {
          return menu.open();
        };

        $rootScope.menu.hide = function() {
          return menu.close();
        };

        vm.close = function() {
          $rootScope.menu.hide()
            .then(function() {
              $log.debug('Navigation close is done');
            });
        };
      }
    };
  });


  app.directive('mdMenu', function() {
    return {
      require: '^mdMenu',
      link: function(scope, elm, attr, ctrl) {
        // now I can expose what I need to the scope
        scope.$mdCloseMenu = ctrl.close;
      }
    };
  });

}
