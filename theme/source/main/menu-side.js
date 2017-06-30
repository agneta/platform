(function() {

    var app = window.angular.module('MainApp');
    var menu;

    app.run(function($rootScope) {
        Object.defineProperty($rootScope, "hasMenu", {
            get: function() {
                return Boolean(menu);
            }
        });
    });

    app.controller('MenuSide', function($rootScope, $element, $scope, $timeout, $mdSidenav, $mdMedia, $http, $compile, $log) {

        menu = $mdSidenav('menu');
        var locked = false;
        var sidebarPath;
        var contentElement = angular.element($element.find('md-content')[0]);

        $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {

            sidebarPath = current.locals.data.sidebar;
            locked = current.locals.data.menuLock;
            $rootScope.hasSidebar = sidebarPath ? true : false;
            contentElement.empty();

            if(!sidebarPath){
              sidebarPath = agneta.langPath('/sidebar');
            }

            sidebarPath =  agneta.urljoin({
                path: [sidebarPath],
                query: {
                    version: agneta.page.version
                }
            });

            $http.get(sidebarPath).then(function(result) {

                $timeout(function() {
                    var sidebarHTML = $compile(result.data)($scope);
                    for(var key in sidebarHTML){
                      var node = sidebarHTML[key];
                      if(node instanceof HTMLElement){
                        contentElement.append(node);
                      }
                    }
                }, 10);
            });

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
                $scope.sidebarHTML = null;
            }, 1400);
        }

        $rootScope.menuLock = function() {
            $scope.isLocked = locked && $mdMedia('gt-sm');
            return $scope.isLocked;
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

        $scope.close = function() {
            $rootScope.hideMenu()
                .then(function() {
                    $log.debug("Navigation close is done");
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

})();
