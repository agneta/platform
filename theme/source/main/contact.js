(function() {

    var app = window.angular.module('MainApp');

    app.controller('ContactCtrl', function($rootScope, $scope, $mdDialog) {

        $scope.open = function() {
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: agneta.partial('contact'),
                controller: 'ContactDialogCtrl'
            });
        };

    });

    app.controller('ContactDialogCtrl', function($rootScope, $scope, $timeout, $controller, $mdDialog, Contact) {

        $scope.tabSelected = 0;

        $scope.isTabActive = function(index) {
            return index == $scope.tabSelected;
        };

        $scope.onTabSelected = function(index) {
            $scope.tabSelected = index;
        };

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.select = function(name) {
            $scope.selected = name;
            $timeout(function() {
                $scope.tabSelected = 1;
            }, 100);
        };

        $scope.send = function(name) {
            var fields = $scope[name+'Fields'];
            //console.log(fields);
            $scope.loading = true;
            Contact[name](fields)
                .$promise
                .finally(function() {
                    $scope.loading = false;
                });
        };


    });


})();
