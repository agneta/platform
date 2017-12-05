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

  app.controller('MenuSide', function($rootScope, $element, $timeout, $mdSidenav, $mdMedia, $http, $compile, $log) {

    menu = $mdSidenav('menu');
    var locked = false;
    //var contentElement = angular.element($element.find('md-content')[0]);
    var vm = this;

    $rootScope.$on('$routeChangeSuccess', function(event, current) {

      locked = current.locals.data.menuLock;
      //contentElement.empty();

      if ($mdMedia('gt-sm')) {

        if (locked) {
          $timeout(function() {
            $rootScope.showMenu();
          }, 1800);
        } else {
          remove();
        }

      }

    });

    function remove() {
      $rootScope.hideMenu();
      $timeout(function() {
        vm.sidebarHTML = null;
      }, 1400);
    }

    $rootScope.menuLock = function() {
      vm.isLocked = locked && $mdMedia('gt-sm');
      return vm.isLocked;
    };

    $rootScope.toggleMenu = function() {
      return menu.toggle();
    };

    $rootScope.showMenu = function() {
      return menu.open();
    };

    $rootScope.hideMenu = function() {
      return menu.close();
    };

    vm.close = function() {
      $rootScope.hideMenu()
        .then(function() {
          $log.debug('Navigation close is done');
        });
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
